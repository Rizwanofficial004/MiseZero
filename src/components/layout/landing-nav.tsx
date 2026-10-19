"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 font-semibold text-ink", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-[0_8px_18px_-8px_rgba(31,154,100,0.9)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M12 4c4 3.2 6 6.4 6 10.2C18 17.6 15.3 20 12 20s-6-2.4-6-5.8C6 10.4 8 7.2 12 4Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path d="M12 8.2c1.6 1.6 2.4 3.1 2.4 4.8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && <span className="text-[17px] tracking-tight">MiseZero</span>}
    </Link>
  );
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-mint-200/80 bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
          <a href="#features" className="transition hover:text-ink">Features</a>
          <a href="#how-it-works" className="transition hover:text-ink">How it works</a>
          <a href="#pos" className="transition hover:text-ink">POS integration</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-ink-muted hover:text-ink sm:inline">
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Start free trial</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-mint-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              Decision support for perishable stock when exact inventory is unknown.
              Built for independent bakeries, cafés, delis and restaurants.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-ink">Product</p>
              <ul className="mt-3 space-y-2 text-ink-muted">
                <li><a href="#features" className="hover:text-ink">Features</a></li>
                <li><a href="#pos" className="hover:text-ink">Integrations</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink">Company</p>
              <ul className="mt-3 space-y-2 text-ink-muted">
                <li>About</li>
                <li>Food safety</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink">Legal</p>
              <ul className="mt-3 space-y-2 text-ink-muted">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Data processing</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-ink-muted/70">
          © 2026 MiseZero. Prototype — decision support only. Recommendations require human approval.
        </p>
      </div>
    </footer>
  );
}
