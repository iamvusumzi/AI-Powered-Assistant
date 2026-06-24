import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { getStats, processDocument } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, BookOpen, Sparkles, CheckCircle2, ListChecks } from "lucide-react";

const MIN_LEN = 50;

export function WorkspaceLanding() {
  const getStatsFn = useServerFn(getStats);
  const processFn = useServerFn(processDocument);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStatsFn(),
  });

  const [meetingText, setMeetingText] = useState("");
  const [researchText, setResearchText] = useState("");

  const mut = useMutation({
    mutationFn: (vars: { type: "meeting_notes" | "research"; raw_input: string }) =>
      processFn({ data: vars }),
    onSuccess: (res) => {
      if (res.usingMock) {
        toast.warning("AI key not configured — showing rich demo content.");
      } else {
        toast.success("Analysis complete");
      }
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
      const convId = (res as { conversation?: { id: string }; document: { conversation_id: string | null } }).conversation?.id ?? res.document.conversation_id;
      if (convId) navigate({ to: "/workspace/$conversationId", params: { conversationId: convId } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to process"),
  });

  const submit = (type: "meeting_notes" | "research") => {
    const text = type === "meeting_notes" ? meetingText : researchText;
    if (text.trim().length < MIN_LEN) {
      toast.warning(`Please provide at least ${MIN_LEN} characters to prevent AI hallucinations.`);
      return;
    }
    mut.mutate({ type, raw_input: text.trim() });
  };

  const counters = [
    { label: "Total Analyses Assisted", value: stats.data?.total ?? 0, icon: Sparkles },
    { label: "Action Items Captured", value: stats.data?.actions ?? 0, icon: ListChecks },
    { label: "Human-Verified Tasks", value: stats.data?.verified ?? 0, icon: CheckCircle2 },
  ];

  const isPending = mut.isPending;

  return (
    <div className="flex flex-col items-center px-4 py-10 md:py-16 animate-in fade-in duration-500">
      <div className="max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> AI-powered · Lovable Cloud
        </div>
        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
          Maximize Your Workplace <span className="text-brand">Velocity</span>.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Turn raw meeting transcripts and dense articles into ready-to-send emails and client-ready briefs in two clicks.
        </p>
      </div>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {counters.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{c.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="relative overflow-hidden p-6 transition-all hover:shadow-glow">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/5 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Analyze Meeting Notes</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste raw meeting transcripts or notes. We'll extract a summary, owners, deadlines, and a clean action checklist.
          </p>
          <textarea
            value={meetingText}
            onChange={(e) => setMeetingText(e.target.value)}
            rows={6}
            placeholder="Paste your meeting notes here…"
            className="mt-3 w-full resize-y rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{meetingText.length} / {MIN_LEN}+ chars</span>
            <Button onClick={() => submit("meeting_notes")} disabled={isPending}>
              {isPending ? "Analyzing…" : "Analyze meeting"}
            </Button>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 transition-all hover:shadow-glow">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/40 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">Research Assistant</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Drop in dense articles, reports, or raw research. We surface core takeaways and strategic recommendations.
          </p>
          <textarea
            value={researchText}
            onChange={(e) => setResearchText(e.target.value)}
            rows={6}
            placeholder="Paste research content here…"
            className="mt-3 w-full resize-y rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{researchText.length} / {MIN_LEN}+ chars</span>
            <Button onClick={() => submit("research")} disabled={isPending}>
              {isPending ? "Analyzing…" : "Run research"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
