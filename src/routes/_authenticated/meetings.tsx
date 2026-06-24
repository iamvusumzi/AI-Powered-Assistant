import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDocuments } from "@/lib/documents.functions";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/meetings")({
  component: MeetingsArchive,
});

function MeetingsArchive() {
  const listFn = useServerFn(listDocuments);
  const q = useQuery({
    queryKey: ["documents", "meeting_notes"],
    queryFn: () => listFn({ data: { type: "meeting_notes" } }),
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Meeting Notes</h1>
        <p className="text-sm text-muted-foreground">All analyzed meeting transcripts.</p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Action items</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!q.isLoading && (q.data?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                No meeting notes yet. Analyze your first one from the Workspace.
              </td></tr>
            )}
            {q.data?.map((d) => {
              const sd = (d.structured_data ?? {}) as { tasks?: unknown[] };
              const count = Array.isArray(sd.tasks) ? sd.tasks.length : 0;
              return (
                <tr key={d.id} className="border-t hover:bg-accent/30">
                  <td className="px-4 py-3 font-medium">{d.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    {d.conversation_id && (
                      <Link to="/workspace/$conversationId" params={{ conversationId: d.conversation_id }} className="text-brand hover:underline">
                        Open
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
