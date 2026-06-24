import ReactMarkdown from "react-markdown";
import { VerifyBadge } from "./verify-badge";
import { AlertTriangle } from "lucide-react";

type Task = { id: string; task: string; owner?: string; due?: string };

export function DocumentPanel({
  title,
  type,
  summary,
  tasks,
  verifications,
  documentId,
}: {
  title: string;
  type: "meeting_notes" | "research";
  summary: string;
  tasks: Task[];
  verifications: Record<string, boolean>;
  documentId: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="rounded bg-accent px-2 py-0.5">
            {type === "meeting_notes" ? "Meeting Notes" : "Research"}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <article className="prose-velocity max-w-3xl">
          <ReactMarkdown
            components={{
              h1: (p) => <h1 className="mt-6 text-2xl font-bold" {...p} />,
              h2: (p) => <h2 className="mt-6 text-xl font-semibold" {...p} />,
              h3: (p) => <h3 className="mt-6 text-lg font-semibold border-l-2 border-brand pl-3" {...p} />,
              p: (p) => <p className="my-3 leading-relaxed text-foreground/90" {...p} />,
              ul: (p) => <ul className="my-3 ml-5 list-disc space-y-1.5" {...p} />,
              li: (p) => <li className="text-foreground/90" {...p} />,
              code: (p) => <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...p} />,
              strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
            }}
          >
            {summary}
          </ReactMarkdown>

          {tasks.length > 0 && (
            <section className="mt-8 rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tracked Action Items</h3>
              <ul className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 rounded-lg border bg-background p-3">
                    <div className="min-w-0">
                      <div className="font-medium">{t.task}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {t.owner ? `Owner: ${t.owner}` : "Unassigned"}
                        {t.due ? ` · Due: ${t.due}` : ""}
                      </div>
                    </div>
                    <VerifyBadge documentId={documentId} taskId={t.id} verified={!!verifications[t.id]} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>

      <div className="sticky bottom-0 border-t bg-warning/10 px-6 py-2.5 text-xs text-warning-foreground flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        AI-generated content can be inaccurate. Please review and validate critical items.
      </div>
    </div>
  );
}
