import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MAX_INPUT = 12000;
const MIN_INPUT = 50;

const ProcessInput = z.object({
  type: z.enum(["meeting_notes", "research"]),
  raw_input: z.string().min(MIN_INPUT, `Input must be at least ${MIN_INPUT} characters`).max(MAX_INPUT),
});

type ActionItem = { task: string; owner?: string; due?: string; done?: boolean; id: string };

const MEETING_SYSTEM = `You are an expert meeting analyst. Analyse the meeting notes and return STRICT markdown with EXACTLY these sections:

### Executive Summary
A 2-3 sentence summary of the meeting.

### Action Items
- [ ] Task description — Owner: <name or Unassigned> — Due: <date or TBD>
(One bullet per action item.)

### Key Decisions
- Bullet list of decisions made.

### Deadlines
- Bullet list of dates and what is due.

Be concise. Do not invent details not in the source.`;

const RESEARCH_SYSTEM = `You are a research analyst. Analyse the supplied content and return STRICT markdown with EXACTLY these sections:

### Core Takeaways
- 3-6 bullet points capturing the most important insights.

### Strategic Recommendations
- 3-5 bullet points with concrete recommended actions.

Be precise, neutral, and avoid speculation.`;

function parseActionItems(markdown: string): ActionItem[] {
  const lines = markdown.split("\n");
  const items: ActionItem[] = [];
  let inAction = false;
  for (const line of lines) {
    if (/^###\s+Action Items/i.test(line)) { inAction = true; continue; }
    if (/^###\s+/.test(line)) { inAction = false; continue; }
    if (!inAction) continue;
    const m = line.match(/^\s*[-*]\s*(?:\[[ xX]\]\s*)?(.+)$/);
    if (!m) continue;
    const text = m[1].trim();
    const ownerMatch = text.match(/Owner:\s*([^—\-|]+?)(?:\s*[—\-|]\s*Due:|$)/i);
    const dueMatch = text.match(/Due:\s*(.+)$/i);
    const task = text.replace(/—\s*Owner:.*$/i, "").replace(/—\s*Due:.*$/i, "").trim();
    items.push({
      id: crypto.randomUUID(),
      task,
      owner: ownerMatch?.[1].trim(),
      due: dueMatch?.[1].trim(),
      done: false,
    });
  }
  return items;
}

async function generateTitle(provider: ReturnType<typeof createLovableAiGatewayProvider>, summary: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: provider("google/gemini-3-flash-preview"),
      prompt: `Write a concise 3-4 word title for this content. Return ONLY the title, no quotes:\n\n${summary.slice(0, 800)}`,
    });
    return text.trim().replace(/^["']|["']$/g, "").slice(0, 60) || "Untitled";
  } catch {
    return "Untitled";
  }
}

export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProcessInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      // Mock fallback
      const mock =
        data.type === "meeting_notes"
          ? `### Executive Summary\nDemo summary — AI key not configured.\n\n### Action Items\n- [ ] Review pricing proposal — Owner: Alex — Due: Friday\n- [ ] Schedule follow-up with design — Owner: Priya — Due: Next Tuesday\n\n### Key Decisions\n- Launch will ship behind a feature flag.\n\n### Deadlines\n- Friday: pricing decision.`
          : `### Core Takeaways\n- Demo content — AI key not configured.\n- Market is shifting toward hybrid models.\n\n### Strategic Recommendations\n- Invest in onboarding.\n- Run a small pilot first.`;
      const items = parseActionItems(mock);
      const { data: doc, error } = await context.supabase
        .from("processed_documents")
        .insert({
          user_id: context.userId,
          type: data.type,
          title: "Demo Analysis",
          raw_input: data.raw_input,
          summary_output: mock,
          structured_data: { tasks: items, verifications: {} },
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { document: doc, usingMock: true };
    }

    const provider = createLovableAiGatewayProvider(key);
    const system = data.type === "meeting_notes" ? MEETING_SYSTEM : RESEARCH_SYSTEM;

    let summary: string;
    try {
      const result = await generateText({
        model: provider("google/gemini-3-flash-preview"),
        system,
        prompt: data.raw_input,
      });
      summary = result.text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed";
      throw new Error(msg);
    }

    const tasks = data.type === "meeting_notes" ? parseActionItems(summary) : [];

    // Create conversation + insert document
    const { data: conv, error: convErr } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, title: "New conversation" })
      .select()
      .single();
    if (convErr) throw new Error(convErr.message);

    const { data: doc, error: docErr } = await context.supabase
      .from("processed_documents")
      .insert({
        user_id: context.userId,
        conversation_id: conv.id,
        type: data.type,
        title: "Untitled",
        raw_input: data.raw_input,
        summary_output: summary,
        structured_data: { tasks, verifications: {} },
      })
      .select()
      .single();
    if (docErr) throw new Error(docErr.message);

    // Background auto-title (await is fine, fast)
    const title = await generateTitle(provider, summary);
    await context.supabase.from("processed_documents").update({ title }).eq("id", doc.id);
    await context.supabase.from("conversations").update({ title }).eq("id", conv.id);

    return { document: { ...doc, title }, conversation: { ...conv, title }, usingMock: false };
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ type: z.enum(["meeting_notes", "research"]).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("processed_documents").select("*").order("created_at", { ascending: false });
    if (data.type) q = q.eq("type", data.type);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ conversationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc } = await context.supabase
      .from("processed_documents")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .maybeSingle();
    const { data: messages } = await context.supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .order("created_at");
    return { document: doc, messages: messages ?? [] };
  });

export const getStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: docs } = await context.supabase
      .from("processed_documents")
      .select("structured_data");
    let total = 0;
    let actions = 0;
    let verified = 0;
    for (const d of docs ?? []) {
      total += 1;
      const sd = (d.structured_data ?? {}) as { tasks?: unknown[]; verifications?: Record<string, boolean> };
      actions += Array.isArray(sd.tasks) ? sd.tasks.length : 0;
      const v = sd.verifications ?? {};
      verified += Object.values(v).filter(Boolean).length;
    }
    return { total, actions, verified };
  });

export const toggleVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ documentId: z.string().uuid(), taskId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc, error } = await context.supabase
      .from("processed_documents")
      .select("structured_data")
      .eq("id", data.documentId)
      .single();
    if (error) throw new Error(error.message);
    const sd = (doc.structured_data ?? {}) as Record<string, unknown>;
    const verifications = { ...((sd.verifications as Record<string, boolean> | undefined) ?? {}) };
    verifications[data.taskId] = !verifications[data.taskId];
    const next = { ...sd, verifications };
    const { error: uErr } = await context.supabase
      .from("processed_documents")
      .update({ structured_data: next as never })
      .eq("id", data.documentId);
    if (uErr) throw new Error(uErr.message);
    return { verifications: v };
  });
