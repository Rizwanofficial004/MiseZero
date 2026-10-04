"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  Boxes,
  Cable,
  ChartNoAxesCombined,
  Gauge,
  ClipboardList,
  Hand,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  WandSparkles,
} from "lucide-react";
import { Logo } from "@/components/layout/landing-nav";
import { cafeProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Daily Action Hub", icon: House },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellRing },
  { href: "/dashboard/intake", label: "Smart Intake", icon: ScanLine },
  { href: "/dashboard/staff-inputs", label: "Manual & Staff", icon: Hand },
  { href: "/dashboard/inventory", label: "Stock Estimates", icon: Boxes },
  { href: "/dashboard/recommendations", label: "Rescue Optimiser", icon: WandSparkles },
  { href: "/dashboard/waste", label: "Waste & Evidence", icon: ClipboardList },
  { href: "/dashboard/data-sources", label: "Data Sources", icon: Cable },
  { href: "/dashboard/integrations", label: "POS Mapping", icon: ChartNoAxesCombined },
  { href: "/dashboard/outcomes", label: "Outcomes", icon: Gauge },
  { href: "/dashboard/calibration", label: "Calibration", icon: ShieldCheck },
  { href: "/dashboard/settings", label: "Settings", icon: SlidersHorizontal },
];

export function DashboardSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#e2ebe5] bg-white transition-[width] duration-300",
        collapsed ? "w-[64px]" : "w-56",
      )}
    >
      <div className={cn("flex items-center border-b border-[#edf3ee] p-3", collapsed ? "justify-center" : "justify-between px-3.5")}>
        <Logo compact={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-xl p-1.5 text-ink-muted hover:bg-mint-50 hover:text-ink"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="border-b border-[#edf3ee] px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Pilot site</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">{cafeProfile.name}</p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="mb-1 flex w-full items-center justify-center rounded-xl p-2.5 text-ink-muted hover:bg-mint-50 hover:text-ink"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-mint-100 font-semibold text-mint-700"
                  : "text-ink-muted hover:bg-mint-50 hover:text-ink",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.7} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-[#edf3ee] p-2.5">
          <div className="rounded-2xl bg-mint-50 p-3 text-xs text-ink-muted">
            <p className="flex items-center gap-1.5 font-semibold text-mint-700">
              <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Decision support
            </p>
            <p className="mt-1 leading-relaxed">Recommendations need staff approval. Safety rules cannot be overridden.</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export function DashboardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-5 pb-2 pt-5">
      <h1 className="font-serif text-2xl text-ink">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
