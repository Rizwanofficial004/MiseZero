import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/landing-nav";
import { plans } from "@/lib/data";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-mint-50 px-4 py-12">
      <div className="animate-blob pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-mint-200/80 blur-3xl" />
      <div className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <p className="mt-4 text-sm text-ink-muted">Create your MiseZero pilot account</p>
        </div>
        <Card>
          <CardContent className="p-7">
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="name">Full name</label>
                  <input id="name" type="text" placeholder="Sarah Chen" className="input-field mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="venue">Venue name</label>
                  <input id="venue" type="text" placeholder="Bloom & Crumb Café" className="input-field mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="email">Work email</label>
                <input id="email" type="email" placeholder="sarah@bloomandcrumb.co.uk" className="input-field mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="plan">Plan</label>
                <select id="plan" className="input-field mt-1">
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price > 0 ? `£${p.price}/mo` : "Custom"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="pos">Primary POS system</label>
                <select id="pos" className="input-field mt-1">
                  <option>Square</option>
                  <option>Toast</option>
                  <option>Lightspeed</option>
                  <option>Epos Now</option>
                  <option>Manual / no POS API</option>
                  <option>Other / not sure yet</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" className="input-field mt-1" />
              </div>
              <Link href="/dashboard" className="block">
                <Button className="w-full" type="button">Create account & start trial</Button>
              </Link>
            </form>
            <p className="mt-4 text-center text-sm text-ink-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-mint-700 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
