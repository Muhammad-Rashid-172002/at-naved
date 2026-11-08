"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";

const axis = { fontSize: 12, fill: "#8A6A60" };
const tooltipStyle = { borderRadius: 12, border: "1px solid #EDE3D3", fontSize: 13 };

export function SalesAreaChart({ data, height = 260 }: { data: { label: string; sales: number; orders: number }[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC21A" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#FFC21A" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#EDE3D3" vertical={false} />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => (name === "sales" ? [formatPrice(v), "Sales"] : [v, "Orders"])} />
          <Area type="monotone" dataKey="sales" stroke="#3B1611" strokeWidth={2.5} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPie({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-bold tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HorizontalBars({ data, valueKey, labelKey, money }: { data: Record<string, string | number>[]; valueKey: string; labelKey: string; money?: boolean }) {
  return (
    <div style={{ height: Math.max(160, data.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey={labelKey} tick={{ ...axis, fill: "#3B1611" }} width={150} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#FFF6D9" }} formatter={(v: number) => (money ? formatPrice(v) : v)} />
          <Bar dataKey={valueKey} fill="#E0301E" radius={[0, 8, 8, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ColumnChart({ data, valueKey, labelKey, height = 220 }: { data: Record<string, string | number>[]; valueKey: string; labelKey: string; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#EDE3D3" vertical={false} />
          <XAxis dataKey={labelKey} tick={axis} tickLine={false} axisLine={false} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#FFF6D9" }} />
          <Bar dataKey={valueKey} fill="#FFC21A" stroke="#3B1611" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
