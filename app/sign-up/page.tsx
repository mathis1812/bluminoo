"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Panel from "@/components/Panel";
import { readAcquisition } from "@/lib/acquisition";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: readAcquisition() },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("password")) {
          setError("Le mot de passe doit faire au moins 6 caractères.");
        } else {
          setError("Quelque chose a planté, réessaie dans un instant.");
        }
        return;
      }

      // With email confirmation disabled, Supabase returns an "empty"
      // user (identities === []) if the email is already in use, rather
      // than an explicit error.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("Cette adresse e-mail est déjà liée à un compte.");
        return;
      }

      // Même correction que /sign-in et AuthSheet : le studio est la
      // destination après création de compte, pas l'ancienne /account.
      router.push("/");
      router.refresh();
    } catch {
      setError("Quelque chose a planté, réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up mx-auto max-w-md py-8">
      <div className="mb-8 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
          Inscription
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">
          Crée ton compte Bluminoo
        </h2>
      </div>

      <Panel className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-400"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-400"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-snap px-4 py-3 text-sm font-semibold text-[#121212] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="text-primary-soft hover:underline">
            Connecte-toi
          </Link>
        </p>
      </Panel>
    </div>
  );
}
