import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDocuments } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, Plus, FileText, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/workspace/")({
  component: WorkspaceEmpty,
});

function WorkspaceEmpty() {
  const listFn = useServerFn(listDocuments);
  const { data: docs } = useQuery({
    queryKey: ["documents", "recent"],
    queryFn: () => listFn({ data: {} }),
  });
  const recent = (docs ?? []).slice(0, 3);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center animate-in fade-in duration-500">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border bg-card text-muted-foreground">
        <LayoutDashboard className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">No Active Session Selected</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick up where you left off, or start a fresh analysis from the dashboard.
      </p>

      <Button asChild size="lg" className="mt-6">
        <Link to="/dashboard">
          <Plus className="mr-2 h-4 w-4" /> Start New Analysis
        </Link>
      </Button>

      {recent.length > 0 && (
        <div className="mt-12 w-full text-left">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recent.map((d) => {
              const Icon = d.type === "meeting_notes" ? FileText : BookOpen;
              return (
                <Link
                  key={d.id}
                  to="/workspace/$conversationId"
                  params={{ conversationId: d.conversation_id ?? d.id }}
                  className="group"
                >
                  <Card className="h-full p-4 transition-all hover:border-brand/40 hover:shadow-glow">
                    <div className="flex items-start justify-between gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-medium">{d.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
