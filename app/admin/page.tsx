import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { getAdminContent } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isAdminConfigured();

  if (!configured) {
    return (
      <main className="mx-auto min-h-screen max-w-[760px] px-5 py-16 text-foreground">
        <div className="rounded-[24px] border border-line bg-background-soft p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground-muted">Admin setup</p>
          <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-foreground">
            Add your admin password first
          </h1>
          <p className="mt-4 max-w-[38rem] text-[15px] leading-7 text-foreground-soft">
            To enable the built-in editor, add <code>ADMIN_PASSWORD</code> to your local
            environment and Vercel project settings. For production saves, also add a GitHub
            token as <code>GITHUB_ADMIN_TOKEN</code>.
          </p>
        </div>
      </main>
    );
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[760px] items-center px-5 py-16">
        <AdminLoginForm />
      </main>
    );
  }

  const content = await getAdminContent();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 pb-0 pt-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground-muted">Portfolio admin</p>
          <h1 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
            Edit your site content
          </h1>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-sm text-foreground-muted hover:border-line-strong hover:text-foreground"
          >
            Log out
          </button>
        </form>
      </div>
      <AdminDashboard initialData={content} />
    </main>
  );
}
