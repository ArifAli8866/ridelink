import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "./utils/cn";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21c4-3.5 6-7 6-11a6 6 0 1 0-12 0c0 4 2 7.5 6 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      </div>
      <div className="leading-none">
        <p className={cn("text-[17px] font-extrabold tracking-tight", light ? "text-white" : "text-slate-900")}>
          Ride<span className="text-emerald-500">Link</span>
        </p>
        <p className={cn("text-[10px] font-medium", light ? "text-emerald-200/80" : "text-slate-400")}>
          share · save · sustain
        </p>
      </div>
    </div>
  );
}

export function Avatar({
  initials,
  gradient,
  size = 40,
  online,
  ring,
  className,
}: {
  initials: string;
  gradient: string;
  size?: number;
  online?: boolean;
  ring?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <div
        className={cn(
          "grid h-full w-full place-items-center rounded-full bg-gradient-to-br font-bold text-white",
          gradient,
          ring && "ring-2 ring-white shadow-md"
        )}
        style={{ fontSize: size * 0.36 }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0 -right-0 block rounded-full border-2 border-white",
            online ? "bg-emerald-500" : "bg-slate-300"
          )}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}

export function Stars({ value, size = 13, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </span>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Progress({ value, className, barClass }: { value: number; className?: string; barClass?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700", barClass)}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

export function Donut({
  segments,
  size = 132,
  thickness = 18,
  center,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: ReactNode;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {center && <div className="absolute inset-0 grid place-items-center text-center">{center}</div>}
    </div>
  );
}

export function Bars({
  data,
  height = 150,
  accent = "#10b981",
  format,
}: {
  data: { label: string; value: number }[];
  height?: number;
  accent?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-1 items-end">
            <div
              className="animate-bar w-full rounded-lg"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: `linear-gradient(to top, ${accent}, ${accent}bb)`,
                animationDelay: `${i * 80}ms`,
              }}
              title={format ? format(d.value) : String(d.value)}
            />
          </div>
          <span className="text-[11px] font-medium text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const TINTS: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600",
  rose: "bg-rose-50 text-rose-600",
};

export function Stat({
  icon,
  label,
  value,
  sub,
  tint = "emerald",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tint?: keyof typeof TINTS | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={cn("mb-3 grid h-9 w-9 place-items-center rounded-xl", TINTS[tint] ?? TINTS.emerald)}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-emerald-600">{sub}</p>}
    </div>
  );
}
