"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANY } from "@/lib/company";
import { signIn } from "@/lib/store";
import { Logo } from "@/components/ui";

const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    // Demo-mode session. When Firebase env vars are configured, replace this
    // with signInWithEmailAndPassword from firebase/auth (see README).
    signIn(email);
    router.push("/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-harbor-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <h1 className="text-center text-xl font-extrabold text-harbor-950">Owner Sign In</h1>
          <p className="text-center text-xs text-slate-400">
            {firebaseConfigured
              ? "Sign in with your Firebase account."
              : "Demo mode — any email and password (4+ chars) signs you in. Configure Firebase in .env.local for real accounts."}
          </p>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={COMPANY.email} autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
          <button className="btn-primary w-full py-2.5">Sign In</button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          {COMPANY.name} · {COMPANY.phone}
        </p>
      </div>
    </div>
  );
}
