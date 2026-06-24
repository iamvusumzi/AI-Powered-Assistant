import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDocument } from "@/lib/documents.functions";
import { DocumentPanel } from "@/components/document-panel";
import { FloatingChat } from "@/components/floating-chat";
import type { UIMessage } from "ai";

export const Route = createFileRoute("/_authenticated/workspace/$conversationId")({
  component: WorkspaceConversation,
});

type Task = { id: string; task: string; owner?: string; due?: string };

function WorkspaceConversation() {
  const { conversationId } = Route.useParams();
  const getDocFn = useServerFn(getDocument);
  const q = useQuery({
    queryKey: ["document", conversationId],
    queryFn: () => getDocFn({ data: { conversationId } }),
  });

  if (q.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!q.data?.document) {
    return <div className="p-8 text-sm text-muted-foreground">Document not found.</div>;
  }

  const doc = q.data.document;
  const sd = (doc.structured_data ?? {}) as { tasks?: Task[]; verifications?: Record<string, boolean> };
  const tasks = sd.tasks ?? [];
  const verifications = sd.verifications ?? {};

  const initialMessages: UIMessage[] = (q.data.messages ?? []).map((m) => ({
    id: m.id,
    role: m.sender === "user" ? "user" : "assistant",
    parts: [{ type: "text", text: m.message_text }],
  }));

  return (
    <div className="relative h-full">
      <DocumentPanel
        title={doc.title}
        type={doc.type as "meeting_notes" | "research"}
        summary={doc.summary_output ?? ""}
        tasks={tasks}
        verifications={verifications}
        documentId={doc.id}
      />
      <FloatingChat
        conversationId={conversationId}
        initialMessages={initialMessages}
        activeDocument={{ title: doc.title, summary_output: doc.summary_output ?? "" }}
      />
    </div>
  );
}
