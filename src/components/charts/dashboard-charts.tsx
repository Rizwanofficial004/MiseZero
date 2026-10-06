"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export function WeeklyProtectedChart({
  points,
}: {
  points: Array<{ day: string; protected: number; waste: number }>;
}) {
  const weeklyTrend = points.length > 0 ? points : [{ day: "—", protected: 0, waste: 0 }];
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Value protected this week</p>
            <p className="text-xs text-ink-muted">MiseZero vs expected waste if no action</p>
          </div>
          <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-semibold text-mint-700">Live pilot</span>
        </div>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="protectedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34B87A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34B87A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e6f6ee" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5a6f64" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5a6f64" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #c8ead8",
                  boxShadow: "none",
                }}
              />
              <Area
                type="monotone"
                dataKey="protected"
                name="£ protected"
                stroke="#1f9a64"
                strokeWidth={2.4}
                fill="url(#protectedFill)"
              />
              <Area
                type="monotone"
                dataKey="waste"
                name="Waste units"
                stroke="#9fd9b8"
                strokeWidth={1.6}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfidenceDonut({
  mix,
}: {
  mix: Array<{ name: string; value: number; fill: string }>;
}) {
  const confidenceMix = mix.length > 0 ? mix : [{ name: "None", value: 1, fill: "#e4f1e9" }];
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-ink">Inventory confidence mix</p>
        <p className="text-xs text-ink-muted">How sure we are about remaining stock</p>
        <div className="mt-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={confidenceMix}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={4}
                stroke="none"
              >
                {confidenceMix.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #c8ead8",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-1.5 text-xs text-ink-muted">
          {confidenceMix.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: item.fill }} />
                {item.name}
              </span>
              <span className="font-semibold text-ink">{item.value} SKUs</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
