import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  seedActivity,
  seedIntegrations,
  seedNotifications,
  seedProjects,
  seedRepositories,
  seedSessions,
  seedTickets,
  seedWorkspaces,
} from "@/data/mock";
import type {
  ActivityEvent,
  AppNotification,
  ClaudeSession,
  Integration,
  Project,
  Repository,
  Ticket,
  Workspace,
} from "@/types";

export type ThemePref = "light" | "dark" | "system";

export interface Preferences {
  theme: ThemePref;
  density: "comfortable" | "compact";
  sidebarCollapsed: boolean;
  preferredIde: string;
  workspaceLocation: string;
  branchPattern: string;
  workspacePattern: string;
  claudeModel: string;
  sessionBehavior: "resume_last" | "new_session";
  sessionNaming: string;
  notify: { waiting: boolean; completed: boolean; errors: boolean; builds: boolean };
}

const defaultPrefs = (): Preferences => ({
  theme: "system",
  density: "comfortable",
  sidebarCollapsed: false,
  preferredIde: "Cursor",
  workspaceLocation: "~/dev/atzlan/worktrees",
  branchPattern: "feature/{ticket}",
  workspacePattern: "{ticket} · {title}",
  claudeModel: "Claude Sonnet (mock)",
  sessionBehavior: "resume_last",
  sessionNaming: "{task} – {n}",
  notify: { waiting: true, completed: true, errors: true, builds: false },
});

interface Data {
  projects: Project[];
  repositories: Repository[];
  workspaces: Workspace[];
  sessions: ClaudeSession[];
  tickets: Ticket[];
  activity: ActivityEvent[];
  notifications: AppNotification[];
  integrations: Integration[];
}

const seed = (): Data => ({
  projects: seedProjects(),
  repositories: seedRepositories(),
  workspaces: seedWorkspaces(),
  sessions: seedSessions(),
  tickets: seedTickets(),
  activity: seedActivity(),
  notifications: seedNotifications(),
  integrations: seedIntegrations(),
});

interface AppState extends Data {
  prefs: Preferences;
  selectedWorkspaceId: string | null;
  recentCommands: string[];
  setPrefs: (p: Partial<Preferences>) => void;
  selectWorkspace: (id: string | null) => void;
  pushRecent: (id: string) => void;
  /** Generic mutators used by mock adapters only. */
  patch: (fn: (d: Data) => Partial<Data>) => void;
  resetDemo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...seed(),
      prefs: defaultPrefs(),
      selectedWorkspaceId: "w-142",
      recentCommands: [],
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      selectWorkspace: (id) => set({ selectedWorkspaceId: id }),
      pushRecent: (id) =>
        set((s) => ({ recentCommands: [id, ...s.recentCommands.filter((x) => x !== id)].slice(0, 5) })),
      patch: (fn) => set((s) => fn(s)),
      resetDemo: () => set((s) => ({ ...seed(), selectedWorkspaceId: "w-142", prefs: { ...defaultPrefs(), theme: s.prefs.theme } })),
    }),
    {
      name: "hello-atzlan:v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
