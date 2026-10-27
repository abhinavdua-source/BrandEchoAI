import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app/AppHeader";
import { Spinner } from "@/components/app/ui";
import { useSession } from "@/lib/auth";

// Everything under /app needs a signed-in user and renders in the browser only.
export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  head: () => ({ meta: [{ title: "BrandEchoAI" }, { name: "robots", content: "noindex" }] }),
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner />
    </div>
  ),
  component: AppLayout,
});

function AppLayout() {
  const { user } = useSession();
  return (
    <div data-clarity-mask="True" className="flex min-h-screen flex-col bg-paper">
      <AppHeader email={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-[1160px] flex-1 px-6 pt-[clamp(32px,5vw,56px)] pb-20">
        <Outlet />
      </main>
    </div>
  );
}
