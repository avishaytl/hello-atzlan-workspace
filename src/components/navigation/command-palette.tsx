import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Activity, Bot, CheckSquare, FolderKanban, GitBranch, History, LayoutGrid, Layers, Moon, Plus, Settings, Sun, Monitor, RotateCcw, Plug } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { useAppStore } from "@/stores/app-store";
import { useUI } from "@/stores/ui-store";

type Cmd = { id: string; group: string; label: string; hint?: string; keywords?: string; icon: typeof Layers; run: () => void };

/** Spotlight-style palette. In "search" mode it hides actions to act as Global Search. */
export function CommandPalette() {
  const { paletteOpen, paletteMode, setPaletteOpen, openPalette, openWizard } = useUI();
  const navigate = useNavigate();
  const { workspaces, projects, tickets, sessions, repositories, recentCommands, pushRecent, setPrefs } = useAppStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (useUI.getState().paletteOpen) setPaletteOpen(false);
        else openPalette("command");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && e.shiftKey) {
        e.preventDefault();
        openWizard();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette, setPaletteOpen, openWizard]);

  const cmds = useMemo<Cmd[]>(() => {
    const repo = (id: string) => repositories.find((r) => r.id === id)?.name ?? "";
    const go = (to: string) => () => navigate({ to });
    const list: Cmd[] = [
      ...workspaces.filter((w) => w.status !== "archived").map((w) => ({
        id: `ws:${w.id}`, group: "Workspaces", icon: Layers, label: `${w.ticketId ? w.ticketId + " · " : ""}${w.name}`, hint: w.branch,
        keywords: `${w.branch} ${repo(w.repositoryId)} open workspace`, run: () => navigate({ to: "/workspaces/$workspaceId", params: { workspaceId: w.id } }),
      })),
      ...sessions.filter((s) => s.status !== "archived").map((s) => ({
        id: `cs:${s.id}`, group: "Claude Sessions", icon: Bot, label: s.name, hint: workspaces.find((w) => w.id === s.workspaceId)?.ticketId ?? "",
        run: () => navigate({ to: "/claude", search: { session: s.id } }),
      })),
      ...projects.map((p) => ({ id: `pr:${p.id}`, group: "Projects", icon: FolderKanban, label: p.name, hint: p.key, keywords: "open project", run: () => navigate({ to: "/projects/$projectId", params: { projectId: p.id } }) })),
      ...tickets.map((t) => ({ id: `tk:${t.id}`, group: "Tasks", icon: CheckSquare, label: `${t.id} · ${t.title}`, hint: t.status, keywords: "search tasks", run: () => navigate({ to: "/tasks", search: { ticket: t.id } }) })),
    ];
    if (paletteMode === "command") {
      list.push(
        { id: "nav:overview", group: "Navigation", icon: LayoutGrid, label: "Go to Overview", run: go("/overview") },
        { id: "nav:workspaces", group: "Navigation", icon: Layers, label: "Go to Workspaces", run: go("/workspaces") },
        { id: "nav:projects", group: "Navigation", icon: FolderKanban, label: "Go to Projects", run: go("/projects") },
        { id: "nav:claude", group: "Navigation", icon: Bot, label: "Navigate to Claude Sessions", run: go("/claude") },
        { id: "nav:tasks", group: "Navigation", icon: CheckSquare, label: "Go to My Tasks", run: go("/tasks") },
        { id: "nav:activity", group: "Navigation", icon: Activity, label: "Go to Activity", run: go("/activity") },
        { id: "nav:integrations", group: "Navigation", icon: Plug, label: "Go to Integrations", run: go("/integrations") },
        { id: "nav:settings", group: "Navigation", icon: Settings, label: "Open Settings", run: go("/settings") },
        { id: "act:new", group: "Actions", icon: Plus, label: "Create new workspace", keywords: "new add", run: () => openWizard() },
        { id: "act:light", group: "Actions", icon: Sun, label: "Switch theme: Light", run: () => setPrefs({ theme: "light" }) },
        { id: "act:dark", group: "Actions", icon: Moon, label: "Switch theme: Dark", run: () => setPrefs({ theme: "dark" }) },
        { id: "act:system", group: "Actions", icon: Monitor, label: "Switch theme: System", run: () => setPrefs({ theme: "system" }) },
        { id: "act:collapse", group: "Actions", icon: RotateCcw, label: "Toggle sidebar", run: () => setPrefs({ sidebarCollapsed: !useAppStore.getState().prefs.sidebarCollapsed }) },
      );
    }
    return list;
  }, [workspaces, projects, tickets, sessions, repositories, paletteMode, navigate, openWizard, setPrefs]);

  const groups = useMemo(() => {
    const order = paletteMode === "command" ? ["Actions", "Navigation", "Workspaces", "Claude Sessions", "Tasks", "Projects"] : ["Workspaces", "Tasks", "Claude Sessions", "Projects"];
    return order.map((g) => [g, cmds.filter((c) => c.group === g)] as const).filter(([, c]) => c.length);
  }, [cmds, paletteMode]);
  const recent = recentCommands.map((id) => cmds.find((c) => c.id === id)).filter(Boolean) as Cmd[];

  const select = (c: Cmd) => {
    pushRecent(c.id);
    setPaletteOpen(false);
    c.run();
  };

  return (
    <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
      <DialogContent className="top-[18%] translate-y-0 overflow-hidden rounded-[20px] p-0 shadow-pop sm:max-w-[620px] [&>button]:hidden">
        <DialogTitle className="sr-only">{paletteMode === "search" ? "Search" : "Command palette"}</DialogTitle>
        <Command className="bg-popover" loop>
          <CommandInput placeholder={paletteMode === "search" ? "Search workspaces, tickets, branches, sessions…" : "Type a command or search…"} className="h-12 text-[14px]" />
          <CommandList className="max-h-[420px] p-1.5">
            <CommandEmpty>No matching workspaces or tasks found.</CommandEmpty>
            {recent.length > 0 && (
              <CommandGroup heading="Recent">
                {recent.map((c) => (
                  <CommandItem key={`r-${c.id}`} value={`recent ${c.label}`} onSelect={() => select(c)} className="rounded-lg">
                    <History className="text-muted-foreground" /> {c.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {groups.map(([g, items]) => (
              <CommandGroup key={g} heading={g}>
                {items.map((c) => (
                  <CommandItem key={c.id} value={`${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`} onSelect={() => select(c)} className="rounded-lg">
                    <c.icon className="text-muted-foreground" />
                    <span className="truncate">{c.label}</span>
                    {c.hint && <CommandShortcut className="flex items-center gap-1 font-mono text-[11px] tracking-normal">{c.group === "Workspaces" && <GitBranch className="size-3" />}{c.hint}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <div className="flex items-center gap-4 border-t px-4 py-2 text-[11px] text-muted-foreground">
            <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
            <span className="ml-auto">hello atzlan</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
