import { createFileRoute } from "@tanstack/react-router";

// GET /api/health — readiness of the deployed server (see src/server/health.ts).
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { healthReport } = await import("@/server/health");
        const report = await healthReport();
        const ok = report.anthropicKeySet && report.claudeReachable && report.databaseReachable;
        return Response.json(report, {
          status: ok ? 200 : 503,
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
