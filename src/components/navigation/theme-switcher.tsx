import { Monitor, Moon, Sun } from "lucide-react";
import { useAppStore, type ThemePref } from "@/stores/app-store";
import { cn } from "@/lib/utils";

const opts: { v: ThemePref; icon: typeof Sun; label: string }[] = [
  { v: "light", icon: Sun, label: "Light" },
  { v: "dark", icon: Moon, label: "Dark" },
  { v: "system", icon: Monitor, label: "System" },
];

export function ThemeSwitcher({ compact }: { compact?: boolean }) {
  const theme = useAppStore((s) => s.prefs.theme);
  const setPrefs = useAppStore((s) => s.setPrefs);
  if (compact) {
    const next = opts[(opts.findIndex((o) => o.v === theme) + 1) % 3]!;
    const Cur = opts.find((o) => o.v === theme)!.icon;
    return (
      <button aria-label={`Theme: ${theme}. Switch to ${next.label}`} title={`Theme: ${theme}`} onClick={() => setPrefs({ theme: next.v })} className="grid size-9 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Cur className="size-4" />
      </button>
    );
  }
  return (
    <div role="radiogroup" aria-label="Theme" className="flex rounded-[10px] bg-secondary p-0.5">
      {opts.map(({ v, icon: I, label }) => (
        <button key={v} role="radio" aria-checked={theme === v} aria-label={label} title={label} onClick={() => setPrefs({ theme: v })}
          className={cn("grid h-7 flex-1 place-items-center rounded-[8px] text-muted-foreground transition-all duration-150", theme === v && "bg-card text-foreground shadow-sm")}>
          <I className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

export function useApplyTheme() {
  const theme = useAppStore((s) => s.prefs.theme);
  return theme;
}
