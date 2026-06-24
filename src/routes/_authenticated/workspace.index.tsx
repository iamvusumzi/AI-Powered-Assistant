import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLanding } from "@/components/workspace-landing";

export const Route = createFileRoute("/_authenticated/workspace/")({
  component: () => <WorkspaceLanding />,
});
