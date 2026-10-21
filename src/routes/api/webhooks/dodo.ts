import { createFileRoute } from "@tanstack/react-router";

// POST /api/webhooks/dodo — signed events from Dodo Payments (see src/server/billing.ts).
export const Route = createFileRoute("/api/webhooks/dodo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { applyWebhook } = await import("@/server/billing");
        // The signature covers the exact raw body, so read it as text.
        const body = await request.text();
        const headers = Object.fromEntries(request.headers.entries());
        try {
          const result = await applyWebhook(body, headers);
          console.log("[dodo webhook]", JSON.stringify(result));
          return Response.json({ received: true });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[dodo webhook] rejected:", message);
          // 400 for bad signatures; Dodo retries other failures (5xx).
          const badSignature = /signature|timestamp|header/i.test(message);
          return Response.json({ error: "rejected" }, { status: badSignature ? 400 : 500 });
        }
      },
    },
  },
});
