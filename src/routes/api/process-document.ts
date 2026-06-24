// Placeholder server-route alias — processing is handled by the createServerFn
// `processDocument` in src/lib/documents.functions.ts. This file exists to
// satisfy the documented route surface and returns 405 if called directly.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/process-document")({
  server: {
    handlers: {
      POST: async () =>
        new Response(
          JSON.stringify({
            error: "Use the processDocument server function from @/lib/documents.functions",
          }),
          { status: 405, headers: { "content-type": "application/json" } },
        ),
    },
  },
});
