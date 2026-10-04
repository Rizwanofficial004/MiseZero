"use client";

import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { benchmarkComparison, calibrationMetrics } from "@/lib/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";

export default function CalibrationPage() {
  const chartData = benchmarkComparison.metrics.map((m) => ({
    name: m.label.split(" ")[0],
    baseline: m.baseline,
    misezero: m.misezero,
  }));

  const radial = [
    { name: "Coverage", value: 87, fill: "#34B87A" },
    { name: "Calibration", value: 82, fill: "#5FC992" },
    { name: "Acceptance", value: 74, fill: "#9FD9B8" },
  ];

  return (
    <div>
      <DashboardHeader
        title="Calibration Dashboard"
        description="Model performance evidence — critical for endorsement and pilot validation"
      />
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {calibrationMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-ink-muted">{metric.label}</p>
                  <Badge variant={metric.status === "good" ? "success" : "warning"}>
                    {metric.status}
                  </Badge>
                </div>
                <p className="mt-2 font-serif text-3xl text-ink">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-xs text-ink-muted">Target: {metric.target}{metric.unit}</p>
                <p className="mt-2 text-xs text-ink-muted">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="font-semibold text-ink">MiseZero vs deterministic baseline</h3>
              <p className="text-sm text-ink-muted">{benchmarkComparison.note}</p>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6f6ee" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5a6f64" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#5a6f64" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #c8ead8" }} />
                    <Legend />
                    <Bar dataKey="baseline" fill="#c8ead8" name="Baseline" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="misezero" fill="#34B87A" name="MiseZero" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-ink">Core metrics</h3>
              <p className="text-sm text-ink-muted">Coverage, calibration, acceptance</p>
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="28%" outerRadius="100%" data={radial} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={10} />
                    <Legend iconSize={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-ink">Calibration log (sample)</h3>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-muted">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">System estimate</th>
                  <th className="pb-2">Confirmed</th>
                  <th className="pb-2">In range?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-mint-100">
                  <td className="py-2">Cream</td>
                  <td className="py-2">4.0–5.5 L</td>
                  <td className="py-2">4.6 L</td>
                  <td className="py-2"><Badge variant="success">Yes</Badge></td>
                </tr>
                <tr className="border-t border-mint-100">
                  <td className="py-2">Milk</td>
                  <td className="py-2">7–9 L</td>
                  <td className="py-2">8.2 L</td>
                  <td className="py-2"><Badge variant="success">Yes</Badge></td>
                </tr>
                <tr className="border-t border-mint-100">
                  <td className="py-2">Sandwiches</td>
                  <td className="py-2">9–14</td>
                  <td className="py-2">16</td>
                  <td className="py-2"><Badge variant="warning">No</Badge></td>
                </tr>
                <tr className="border-t border-mint-100">
                  <td className="py-2">Avocado</td>
                  <td className="py-2">5–7</td>
                  <td className="py-2">6</td>
                  <td className="py-2"><Badge variant="success">Yes</Badge></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
