import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Bot, Code2, Info, Keyboard, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, SettingsSection } from "@/components/shared/states";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeSwitcher } from "@/components/navigation/theme-switcher";
import { confirm } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · hello atzlan" },
      { name: "description", content: "Appearance, developer and Claude preferences." },
      { property: "og:title", content: "Settings · hello atzlan" },
      { property: "og:description", content: "Appearance, developer and Claude preferences." },
    ],
  }),
  component: SettingsPage,
});

const SECTIONS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "developer", label: "Developer", icon: Code2 },
  { id: "claude", label: "Claude", icon: Bot },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "about", label: "About", icon: Info },
] as const;

function Sel({ value, onChange, items, id }: { value: string; onChange: (v: string) => void; items: string[]; id?: string }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger id={id}><SelectValue /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select>;
}

function SettingsPage() {
  const [sec, setSec] = useState<(typeof SECTIONS)[number]["id"]>("appearance");
  const { prefs, setPrefs, resetDemo } = useAppStore();
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Settings</h1>
      <div className="grid gap-6 md:grid-cols-[210px_1fr]">
        <nav aria-label="Settings sections" className="space-y-0.5">
          {SECTIONS.map(({ id, label, icon: I }) => (
            <button key={id} onClick={() => setSec(id)} aria-current={sec === id} className={cn("flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13.5px] font-medium", sec === id ? "bg-primary-subtle text-primary" : "text-foreground/80 hover:bg-accent")}>
              <I className="size-4" />{label}
            </button>
          ))}
        </nav>
        <div className="space-y-4">
          {sec === "appearance" && (
            <SettingsSection title="Appearance" description="Saved locally in this browser.">
              <Field label="Theme" hint="System follows your OS"><div className="max-w-[200px]"><ThemeSwitcher /></div></Field>
              <Field label="Interface density" htmlFor="density"><Sel id="density" value={prefs.density} onChange={(v) => setPrefs({ density: v as "compact" })} items={["comfortable", "compact"]} /></Field>
              <Field label="Collapse sidebar"><Switch checked={prefs.sidebarCollapsed} onCheckedChange={(v) => setPrefs({ sidebarCollapsed: v })} /></Field>
            </SettingsSection>
          )}
          {sec === "developer" && (
            <SettingsSection title="Developer Preferences">
              <Field label="Preferred IDE" htmlFor="ide"><Sel id="ide" value={prefs.preferredIde} onChange={(v) => setPrefs({ preferredIde: v })} items={["Cursor", "VS Code", "WebStorm", "Zed"]} /></Field>
              <Field label="Default workspace location" hint="Display preference only" htmlFor="loc"><Input id="loc" className="font-mono text-[12.5px]" value={prefs.workspaceLocation} onChange={(e) => setPrefs({ workspaceLocation: e.target.value })} /></Field>
              <Field label="Branch naming pattern" htmlFor="bp"><Input id="bp" className="font-mono text-[12.5px]" value={prefs.branchPattern} onChange={(e) => setPrefs({ branchPattern: e.target.value })} /></Field>
              <Field label="Workspace naming pattern" htmlFor="wp"><Input id="wp" className="font-mono text-[12.5px]" value={prefs.workspacePattern} onChange={(e) => setPrefs({ workspacePattern: e.target.value })} /></Field>
            </SettingsSection>
          )}
          {sec === "claude" && (
            <SettingsSection title="Claude Preferences" description="Mock preferences — no real Claude installation is configured.">
              <Field label="Preferred model" htmlFor="model"><Sel id="model" value={prefs.claudeModel} onChange={(v) => setPrefs({ claudeModel: v })} items={["Claude Sonnet (mock)", "Claude Opus (mock)", "Claude Haiku (mock)"]} /></Field>
              <Field label="Default session behavior" htmlFor="beh"><Select value={prefs.sessionBehavior} onValueChange={(v) => setPrefs({ sessionBehavior: v as "new_session" })}><SelectTrigger id="beh"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="resume_last">Resume last session</SelectItem><SelectItem value="new_session">Always start new session</SelectItem></SelectContent></Select></Field>
              <Field label="Session naming" htmlFor="sn"><Input id="sn" className="font-mono text-[12.5px]" value={prefs.sessionNaming} onChange={(e) => setPrefs({ sessionNaming: e.target.value })} /></Field>
              <Field label="Notify when Claude waits"><Switch checked={prefs.notify.waiting} onCheckedChange={(v) => setPrefs({ notify: { ...prefs.notify, waiting: v } })} /></Field>
            </SettingsSection>
          )}
          {sec === "shortcuts" && (
            <SettingsSection title="Keyboard Shortcuts">
              {[[`${mod} K`, "Open command palette"], [`${mod} ⇧ N`, "New workspace"], ["↑ ↓", "Navigate palette results"], ["↵", "Select"], ["Esc", "Close dialogs"]].map(([k, l]) => (
                <div key={l} className="flex items-center justify-between text-[13.5px]"><span>{l}</span><kbd className="rounded-md border bg-secondary px-2 py-0.5 font-sans text-[12px]">{k}</kbd></div>
              ))}
            </SettingsSection>
          )}
          {sec === "notifications" && (
            <SettingsSection title="Notifications" description="Simulated in-app notifications.">
              {([["waiting", "Claude waiting for input"], ["completed", "Session completed"], ["errors", "Workspace errors"], ["builds", "Mock build completion"]] as const).map(([k, l]) => (
                <Field key={k} label={l}><Switch checked={prefs.notify[k]} onCheckedChange={(v) => setPrefs({ notify: { ...prefs.notify, [k]: v } })} /></Field>
              ))}
            </SettingsSection>
          )}
          {sec === "about" && (
            <SettingsSection title="About">
              <BrandLogo size={56} />
              <dl className="grid grid-cols-[140px_1fr] gap-y-1.5 text-[13px]">
                <dt className="text-muted-foreground">Frontend version</dt><dd>0.1.0-preview</dd>
                <dt className="text-muted-foreground">Build</dt><dd>Browser · mock adapters</dd>
                <dt className="text-muted-foreground">Links</dt><dd className="text-muted-foreground">Docs · Changelog · Support (coming soon)</dd>
              </dl>
            </SettingsSection>
          )}
          <SettingsSection title="Demo data" description="Restore all workspaces, sessions and notifications to their original state.">
            <div><Button variant="destructive" onClick={async () => { if (await confirm({ title: "Reset demo data?", description: "All local changes to workspaces, sessions and notifications will be lost.", confirmLabel: "Reset", destructive: true })) { resetDemo(); toast.success("Demo data reset"); } }}>Reset Demo Data</Button></div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
