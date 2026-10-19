"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" aria-label={compact ? "MiseZero" : undefined} className={cn("flex items-center gap-2.5 font-semibold text-ink", className)}>
      <img
        src="/logo-mark.png"
        alt=""
        width={558}
        height={516}
        className="h-9 w-9 shrink-0 object-contain"
      />
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
