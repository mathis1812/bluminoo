"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Panel from "@/components/Panel";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 6;

/**
 * Nouveau mot de passe, atteint depuis le lien e-mail via `/auth/confirm`,
 * qui a déjà ouvert la session. Sans session (lien expiré, ouvert dans un
 * autre navigateur), `updateUser` échoue et on renvoie vers une nouvelle
 * demande.
 */
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.error === "expired"
      ? "This link has expired or was opened in another browser. Request a new one from Sign in."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({
      password,
    });
    setLoading(false);
    if (updateError) {
      setError(
        "This link has expired or was opened in another browser. Request a new one from Sign in.",
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="animate-fade-up mx-auto max-w-md px-4 py-8">
      <div className="mb-8 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
          Reset password
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">
          Choose a new password
        </h2>
      </div>

      <Panel className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-400"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-snap px-4 py-3 text-sm font-semibold text-[#121212] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save new password"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
