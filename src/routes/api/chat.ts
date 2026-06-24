import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = {
  messages?: UIMessage[];
  conversationId?: string;
  activeDocument?: { title?: string; summary_output?: string } | null;
};

const SYSTEM_BASE = `You are Velocity, an AI assistant inside a workplace productivity platform.
You help users analyse meeting notes, research articles, and act on action items.
Be concise, structured, and use markdown. Never fabricate facts.
Always remind users to verify critical items.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try { body = (await request.json()) as Body; } catch { return new Response("Invalid JSON", { status: 400 }); }
        const messages = body.messages;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });

        // Auth via bearer token (browser sends it via DefaultChatTransport headers)
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });
        const { data: u, error: ue } = await supabase.auth.getUser(token);
        if (ue || !u.user) return new Response("Unauthorized", { status: 401 });
        const userId = u.user.id;

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "missing_key", usingMock: true }, { status: 503 });
        }

        let system = SYSTEM_BASE;
        if (body.activeDocument?.title && body.activeDocument?.summary_output) {
          system += `\n\nThe user is currently viewing: ${body.activeDocument.title}\n${body.activeDocument.summary_output}`;
        }

        // Persist the latest user message
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (body.conversationId && lastUser) {
          const text = lastUser.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("")
            .trim();
          if (text) {
            await supabase.from("chat_messages").insert({
              conversation_id: body.conversationId,
              user_id: userId,
              sender: "user",
              message_text: text,
            });
          }
        }

        const provider = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: provider("google/gemini-3-flash-preview"),
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            if (!body.conversationId) return;
            const text = responseMessage.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("")
              .trim();
            if (!text) return;
            await supabase.from("chat_messages").insert({
              conversation_id: body.conversationId!,
              user_id: userId,
              sender: "assistant",
              message_text: text,
            });
          },
        });
      },
    },
  },
});
