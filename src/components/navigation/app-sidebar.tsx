import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  CheckSquare,
  FolderKanban,
  LayoutGrid,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/shared/brand-logo";
import { IntegrationIcon, integrationStatus } from "@/components/shared/integration-icon";
import { StatusDot } from "@/components/shared/status-badges";
import { useAppStore } from "@/stores/app-store";
import { ThemeSwitcher } from "./theme-switcher";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/overview", label: "Overview", icon: LayoutGrid },
  { to: "/workspaces", label: "Workspaces", icon: Layers },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/claude", label: "Claude Sessions", icon: Bot },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
  { to: "/activity", label: "Activity", icon: Activity },
] as const;

function NavItem({ to, label, icon: Icon, collapsed, active, badge, children }: { to: string; label: string; icon?: typeof Layers; collapsed: boolean; active: boolean; badge?: React.ReactNode; children?: React.ReactNode }) {
  const inner = (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-9 items-center gap-3 rounded-[10px] px-2.5 text-[13.5px] font-medium transition-colors duration-150",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-accent hover:text-sidebar-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {Icon ? <Icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} /> : children}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge}
    </Link>
  );
  if (!collapsed) return inner;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = useAppStore((s) => s.prefs.sidebarCollapsed);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const integrations = useAppStore((s) => s.integrations);
  const openTasks = useAppStore((s) => s.tickets.filter((t) => t.status !== "Done").length);
  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
        <Link to="/overview" aria-label="hello atzlan home"><BrandLogo collapsed={collapsed} size={collapsed ? 34 : 36} /></Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-2">
        {nav.map((n) => (
          <NavItem key={n.to} {...n} collapsed={collapsed} active={isActive(n.to)}
            badge={n.to === "/tasks" ? <span className="rounded-full bg-secondary px-2 text-[11px] font-semibold tabular-nums text-muted-foreground">{openTasks}</span> : undefined} />
        ))}

        <div className={cn("mt-5 mb-1 flex items-center justify-between px-2.5 text-[11.5px] font-medium text-muted-foreground", collapsed && "justify-center px-0")}>
          {collapsed ? <span className="h-px w-6 bg-border" /> : <><span>Integrations</span><span className="rounded bg-secondary px-1.5 text-[10px] uppercase">demo</span></>}
        </div>
        {integrations.map((i) => {
          const st = integrationStatus(i.status);
          return (
            <NavItem key={i.id} to={`/integrations/${i.id}`} label={i.name} collapsed={collapsed} active={isActive(`/integrations/${i.id}`)}
              badge={<StatusDot tone={st.tone} label={st.label} />}>
              <IntegrationIcon id={i.id} className="size-[18px]" />
            </NavItem>
          );
        })}
      </nav>

      <div className="space-y-1 border-t px-3 py-3">
        <NavItem to="/settings" label="Settings" icon={Settings} collapsed={collapsed} active={isActive("/settings")} />
        {collapsed ? <div className="flex justify-center"><ThemeSwitcher compact /></div> : <div className="px-1 py-1"><ThemeSwitcher /></div>}
        <div className={cn("flex items-center gap-2.5 rounded-[10px] px-2 py-1.5", collapsed && "justify-center px-0")}>
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-subtle text-[12px] font-semibold text-primary" aria-hidden>AT</div>
          {!collapsed && <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium">Avishay Tal</div><div className="text-[11px] text-muted-foreground">Local workspace</div></div>}
          <button
            onClick={() => setPrefs({ sidebarCollapsed: !collapsed })}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground", collapsed && "hidden")}
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
        {collapsed && (
          <button onClick={() => setPrefs({ sidebarCollapsed: false })} aria-label="Expand sidebar" className="mx-auto grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent">
            <PanelLeftOpen className="size-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
