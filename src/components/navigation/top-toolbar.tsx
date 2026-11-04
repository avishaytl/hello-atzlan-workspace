import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/stores/ui-store";
import { NotificationPanel } from "./notification-panel";
import { ThemeSwitcher } from "./theme-switcher";

export function TopToolbar() {
  const openPalette = useUI((s) => s.openPalette);
  const openWizard = useUI((s) => s.openWizard);
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 px-6">
      <button
        onClick={() => openPalette("search")}
        className="flex h-9 w-full max-w-[420px] items-center gap-2 rounded-full border bg-card px-3.5 text-[13px] text-muted-foreground shadow-sm transition-colors hover:border-primary-border"
        aria-label="Search workspaces, tickets, or branches"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">Search workspaces, tickets, or branches…</span>
        <kbd className="rounded-md bg-secondary px-1.5 py-0.5 font-sans text-[11px] font-medium" suppressHydrationWarning>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      <Button size="sm" variant="ghost" className="hidden lg:inline-flex" onClick={() => openWizard()}><Plus /> New</Button>
      <ThemeSwitcher compact />
      <NotificationPanel />
    </header>
  );
}
