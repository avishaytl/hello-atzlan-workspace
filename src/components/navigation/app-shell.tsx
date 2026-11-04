import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";
import { AppSidebar } from "./app-sidebar";
import { TopToolbar } from "./top-toolbar";
import { CommandPalette } from "./command-palette";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { NewWorkspaceWizard } from "@/components/workspaces/new-workspace-wizard";
import { cn } from "@/lib/utils";

function useThemeSync() {
  const theme = useAppStore((s) => s.prefs.theme);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}

function useResponsiveSidebar() {
  const setPrefs = useAppStore((s) => s.setPrefs);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const on = () => mq.matches && setPrefs({ sidebarCollapsed: true });
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [setPrefs]);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const setHydrated = useUI((s) => s.setHydrated);
  const density = useAppStore((s) => s.prefs.density);
  useEffect(() => {
    Promise.resolve(useAppStore.persist.rehydrate()).then(setHydrated);
  }, [setHydrated]);
  useThemeSync();
  useResponsiveSidebar();

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex h-screen w-full overflow-hidden bg-background", density === "compact" && "text-[13px]")}>
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopToolbar />
          <main className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-10">{children}</main>
        </div>
      </div>
      <CommandPalette />
      <NewWorkspaceWizard />
      <ConfirmDialog />
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
