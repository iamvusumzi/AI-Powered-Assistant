import { Check, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toggleVerification } from "@/lib/documents.functions";
import { toast } from "sonner";

export function VerifyBadge({
  documentId,
  taskId,
  verified,
}: {
  documentId: string;
  taskId: string;
  verified: boolean;
}) {
  const toggle = useServerFn(toggleVerification);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => toggle({ data: { documentId, taskId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  return (
    <button
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
        verified
          ? "bg-success/15 text-success border border-success/30"
          : "bg-warning/15 text-warning-foreground border border-warning/40"
      }`}
      title={verified ? "Click to mark as pending review" : "Click to mark as human-verified"}
    >
      {verified ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {verified ? "Human Verified" : "Pending Review"}
    </button>
  );
}
