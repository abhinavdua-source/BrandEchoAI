import { createFileRoute } from "@tanstack/react-router";

// GET /api/health — readiness of the deployed server (see src/server/health.ts).
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { healthReport } = await import("@/server/health");
        const { billingHealth } = await import("@/server/billing");
        const [core, billing] = await Promise.all([healthReport(), billingHealth()]);
        const report = { ...core, billing };
        const ok = core.anthropicKeySet && core.claudeReachable && core.databaseReachable;
        return Response.json(report, {
          status: ok ? 200 : 503,
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
