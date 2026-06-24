import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDocuments } from "@/lib/documents.functions";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/research")({
  component: ResearchArchive,
});

function ResearchArchive() {
  const listFn = useServerFn(listDocuments);
  const q = useQuery({
    queryKey: ["documents", "research"],
    queryFn: () => listFn({ data: { type: "research" } }),
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Research Library</h1>
        <p className="text-sm text-muted-foreground">Synthesized takeaways and recommendations.</p>
      </div>

      {q.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!q.isLoading && (q.data?.length ?? 0) === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No research analyses yet.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {q.data?.map((d) => (
          <Card key={d.id} className="p-5 transition-all hover:shadow-md">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</div>
            <h3 className="mt-1 text-lg font-semibold">{d.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{d.summary_output?.replace(/[#*\-]/g, "").slice(0, 200)}</p>
            {d.conversation_id && (
              <Link to="/workspace/$conversationId" params={{ conversationId: d.conversation_id }} className="mt-4 inline-block text-sm text-brand hover:underline">
                Open analysis →
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
