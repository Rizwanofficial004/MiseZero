"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, Search } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { alerts, cafeProfile } from "@/lib/data/demo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("mz-sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("mz-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex min-h-screen bg-[#f7faf8]">
      <DashboardSidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#e2ebe5] bg-white/90 px-5 backdrop-blur-xl">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
            <input
              className="h-9 w-full rounded-lg border border-[#dfeae2] bg-[#f7faf8] pl-10 pr-4 text-xs outline-none transition focus:border-mint-400 focus:bg-white focus:ring-2 focus:ring-mint-100"
              placeholder="Search stock, invoices, actions…"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/dashboard/alerts"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfeae2] bg-white text-ink-muted hover:text-ink"
            >
              <BellRing className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-mint-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 rounded-lg border border-[#dfeae2] bg-white py-1 pl-1 pr-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint-100 text-xs font-bold text-mint-700">
                BC
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-[11px] font-semibold text-ink">Sarah Chen</p>
                <p className="text-[11px] text-ink-muted">{cafeProfile.name}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
