"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="w-full rounded-[28px] border border-line bg-background-soft p-8 shadow-soft sm:p-10">
      <p className="text-xs uppercase tracking-[0.24em] text-foreground-muted">Private admin</p>
      <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.05em] text-foreground">
        Sign in to update your portfolio
      </h1>
      <p className="mt-4 max-w-[32rem] text-[15px] leading-7 text-foreground-soft">
        This editor lets you update the homepage, showcase items, project pages, and upload new
        images without touching code.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-foreground-muted">Admin password</span>
          <input
            name="password"
            type="password"
            className="w-full rounded-2xl border border-line bg-background px-4 py-3 text-[15px] text-foreground outline-none transition-colors focus:border-line-strong"
            placeholder="Enter your password"
            required
          />
        </label>

        {state?.error ? (
          <p className="text-sm text-[rgb(190,90,90)]">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-88 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Open admin"}
        </button>
      </form>
    </div>
  );
}
