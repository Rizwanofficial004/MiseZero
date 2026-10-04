import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/landing-nav";

export default function LoginPage() {
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
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="manager@bloomandcrumb.co.uk"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="input-field mt-1"
                />
              </div>
              <Link href="/dashboard" className="block">
                <Button className="w-full" type="button">Sign in</Button>
              </Link>
            </form>
            <p className="mt-4 text-center text-sm text-ink-muted">
              No account?{" "}
              <Link href="/signup" className="font-semibold text-mint-700 hover:underline">
                Start free trial
              </Link>
            </p>
            <p className="mt-4 rounded-2xl bg-mint-50 p-3 text-xs text-ink-muted">
              Prototype: any credentials work. You will enter the Bloom & Crumb demo dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
