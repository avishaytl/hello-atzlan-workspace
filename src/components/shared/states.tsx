import { AlertCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandIcon } from "./brand-logo";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, icon: Icon, className }: { title: string; description?: string; action?: React.ReactNode; icon?: LucideIcon; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center", className)}>
      {Icon ? <Icon className="mb-3 size-8 text-muted-foreground" /> : <BrandIcon size={44} className="mb-3 opacity-90" />}
      <p className="text-[15px] font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Unable to complete this simulated action.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-danger/30 bg-danger-subtle px-6 py-10 text-center">
      <AlertCircle className="mb-2 size-7 text-danger" />
      <p className="text-[14px] font-medium">{message}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, glow }: { title: React.ReactNode; subtitle?: string; actions?: React.ReactNode; glow?: boolean }) {
  return (
    <div className={cn("relative -mx-6 -mt-6 mb-6 flex flex-wrap items-end justify-between gap-4 px-6 pt-6 pb-1", glow && "bg-header-glow")}>
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[14px] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function MetricCard({ icon: Icon, value, label, hint, tone = "primary" }: { icon: LucideIcon; value: number | string; label: string; hint?: string; tone?: "primary" | "success" }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card transition-shadow duration-150 hover:shadow-pop">
      <div className={cn("grid size-11 place-items-center rounded-full", tone === "primary" ? "bg-primary-subtle text-primary" : "bg-success-subtle text-success")}>
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="text-[26px] leading-none font-bold tabular-nums">{value}</div>
        <div className="mt-1 truncate text-[13px] text-muted-foreground">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground/80">{hint}</div>}
      </div>
    </div>
  );
}

export function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
      <label htmlFor={htmlFor} className="text-[13px] font-medium">{label}{hint && <span className="block text-[11.5px] font-normal text-muted-foreground">{hint}</span>}</label>
      <div>{children}</div>
    </div>
  );
}

export function PreviewNote({ children = "Preview functionality — nothing here connects to a real service." }: { children?: React.ReactNode }) {
  return <div className="rounded-xl border border-warning/30 bg-warning-subtle px-3 py-2 text-[12.5px] text-warning">{children}</div>;
}
