"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/landing-nav";
import { signIn } from "@/services/activityService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manager@bloomandcrumb.co.uk");
  const [password, setPassword] = useState("pilot");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-mint-50 px-4">
      <div className="animate-blob pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-mint-200/80 blur-3xl" />
      <div className="animate-blob-delay pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-mint-100 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <p className="mt-4 text-sm text-ink-muted">Sign in to your MiseZero pilot</p>
        </div>
        <Card>
          <CardContent className="p-7">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setPending(true);
                setError("");
                void signIn(email, password)
                  .then(() => router.push("/dashboard"))
                  .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not sign in"))
                  .finally(() => setPending(false));
              }}
            >
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-field mt-1" />
              </div>
              {error && <p className="text-sm text-rose-700">{error}</p>}
              <Button className="w-full" type="submit" disabled={pending}>Sign in</Button>
            </form>
            <p className="mt-4 text-center text-sm text-ink-muted">
              No account?{" "}
              <Link href="/signup" className="font-semibold text-mint-700 hover:underline">Start free trial</Link>
            </p>
            <p className="mt-4 rounded-2xl bg-mint-50 p-3 text-xs text-ink-muted">
              This demo keeps a local session in the browser. Any email and password are enough.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
