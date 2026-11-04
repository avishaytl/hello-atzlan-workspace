import { useAppStore, uid } from "@/stores/app-store";
import type { ActionResult, ActivityEvent, Workspace } from "@/types";
import type { Services } from "./interfaces";

const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));
const ok = (message: string): ActionResult => ({ ok: true, message, simulated: true });
const st = () => useAppStore.getState();
const now = () => new Date().toISOString();

function log(e: Omit<ActivityEvent, "id" | "at">) {
  st().patch((d) => ({ activity: [{ ...e, id: uid("e"), at: now() }, ...d.activity] }));
}
function getWs(id: string): Workspace {
  const w = st().workspaces.find((x) => x.id === id);
  if (!w) throw new Error("Workspace not found");
  return w;
}
const label = (w: Workspace) => w.ticketId ?? w.name;

export const mockServices: Services = {
  workspaces: {
    async list() {
      await wait(250);
      return st().workspaces;
    },
    async getById(id) {
      await wait(150);
      return getWs(id);
    },
    async create(input, onStep) {
      for (let i = 0; i < 5; i++) {
        onStep?.(i);
        await wait(550);
      }
      const id = uid("w");
      const t = now();
      const w: Workspace = {
        id, name: input.name, ticketId: input.ticketId, projectId: input.projectId, repositoryId: input.repositoryId,
        branch: input.branch, baseBranch: input.baseBranch, worktreePath: input.worktreePath, status: "active",
        claudeState: input.createSession ? "ready" : "not_initialized", gitState: "clean", modifiedFiles: 0, untrackedFiles: 0,
        ahead: 0, behind: 0, lastCommit: "Initial worktree (simulated)", description: input.description,
        createdAt: t, updatedAt: t, lastOpenedAt: t, preferredIde: st().prefs.preferredIde,
      };
      st().patch((d) => ({
        workspaces: [w, ...d.workspaces],
        tickets: d.tickets.map((tk) => (tk.id === input.ticketId ? { ...tk, workspaceId: id, status: "In Progress" } : tk)),
        sessions: input.createSession
          ? [{ id: uid("cs"), workspaceId: id, name: `${input.name} – 1`, model: input.model, status: "paused", createdAt: t, updatedAt: t, durationMin: 0, lastMessage: "Session prepared (simulated). Not started yet." }, ...d.sessions]
          : d.sessions,
      }));
      log({ kind: "workspace", type: "workspace_created", title: `Workspace ${label(w)} created`, workspaceId: id, projectId: w.projectId });
      return w;
    },
    async rename(id, name) {
      await wait(250);
      st().patch((d) => ({ workspaces: d.workspaces.map((w) => (w.id === id ? { ...w, name, updatedAt: now() } : w)) }));
    },
    async archive(id) {
      await wait(400);
      const w = getWs(id);
      st().patch((d) => ({ workspaces: d.workspaces.map((x) => (x.id === id ? { ...x, status: "archived", updatedAt: now() } : x)) }));
      log({ kind: "workspace", type: "workspace_archived", title: `Workspace ${label(w)} archived`, workspaceId: id, projectId: w.projectId });
    },
    async remove(id) {
      await wait(400);
      st().patch((d) => ({
        workspaces: d.workspaces.filter((w) => w.id !== id),
        sessions: d.sessions.filter((s) => s.workspaceId !== id),
        tickets: d.tickets.map((t) => (t.workspaceId === id ? { ...t, workspaceId: null } : t)),
        selectedWorkspaceId: null,
      } as never));
    },
    async openInIDE(id) {
      await wait(700);
      const w = getWs(id);
      st().patch((d) => ({ workspaces: d.workspaces.map((x) => (x.id === id ? { ...x, lastOpenedAt: now() } : x)) }));
      log({ kind: "workspace", type: "workspace_opened", title: `Opened ${label(w)} in ${w.preferredIde} (simulated)`, workspaceId: id, projectId: w.projectId });
      return ok(`Preview only — would open ${w.worktreePath} in ${w.preferredIde}.`);
    },
  },
  claude: {
    async listSessions(workspaceId) {
      await wait(200);
      return st().sessions.filter((s) => s.workspaceId === workspaceId);
    },
    async startSession(workspaceId, name) {
      await wait(700);
      const w = getWs(workspaceId);
      const count = st().sessions.filter((s) => s.workspaceId === workspaceId).length;
      const t = now();
      st().patch((d) => ({
        sessions: [{ id: uid("cs"), workspaceId, name: name || `${w.name} – ${count + 1}`, model: st().prefs.claudeModel, status: "running", createdAt: t, updatedAt: t, durationMin: 0, lastMessage: "Simulated session started." }, ...d.sessions],
        workspaces: d.workspaces.map((x) => (x.id === workspaceId ? { ...x, claudeState: "running", updatedAt: t } : x)),
      }));
      log({ kind: "claude", type: "session_started", title: `Simulated Claude session started in ${label(w)}`, workspaceId, projectId: w.projectId });
      return ok("Simulated session started. No real Claude process was launched.");
    },
    async resumeSession(sessionId) {
      await wait(600);
      const s = st().sessions.find((x) => x.id === sessionId);
      if (!s) return { ok: false, message: "Unable to complete this simulated action.", simulated: true };
      const t = now();
      st().patch((d) => ({
        sessions: d.sessions.map((x) => (x.id === sessionId ? { ...x, status: "running", attention: undefined, updatedAt: t } : x)),
        workspaces: d.workspaces.map((x) => (x.id === s.workspaceId ? { ...x, claudeState: "running", status: x.status === "paused" ? "active" : x.status, updatedAt: t } : x)),
      }));
      log({ kind: "claude", type: "session_started", title: `Resumed “${s.name}” (simulated)`, workspaceId: s.workspaceId, projectId: getWs(s.workspaceId).projectId });
      return ok(`Resumed “${s.name}” — simulated, no CLI was run.`);
    },
    async resumeLatest(workspaceId) {
      const s = st().sessions
        .filter((x) => x.workspaceId === workspaceId && x.status !== "archived")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (!s) return mockServices.claude.startSession(workspaceId);
      return mockServices.claude.resumeSession(s.id);
    },
    async stopSession(sessionId) {
      await wait(400);
      st().patch((d) => ({ sessions: d.sessions.map((x) => (x.id === sessionId ? { ...x, status: "paused", updatedAt: now() } : x)) }));
      return ok("Session paused (simulated).");
    },
    async renameSession(sessionId, name) {
      await wait(200);
      st().patch((d) => ({ sessions: d.sessions.map((x) => (x.id === sessionId ? { ...x, name } : x)) }));
    },
    async archiveSession(sessionId) {
      await wait(300);
      st().patch((d) => ({ sessions: d.sessions.map((x) => (x.id === sessionId ? { ...x, status: "archived", attention: undefined } : x)) }));
    },
  },
  platform: {
    async openTerminal(path) {
      await wait(400);
      return ok(`Preview only — would open a terminal at ${path}.`);
    },
    async openIDE(path, ide) {
      await wait(500);
      return ok(`Preview only — would open ${path} in ${ide}.`);
    },
    async createPullRequest(workspaceId) {
      await wait(900);
      const w = getWs(workspaceId);
      if (w.gitState !== "ready_for_pr" && w.ahead === 0) {
        return { ok: false, message: "Unable to complete this simulated action — no commits to open a PR from.", simulated: true };
      }
      log({ kind: "git", type: "pr", title: `Draft PR prepared for ${label(w)} (simulated)`, workspaceId, projectId: w.projectId });
      return ok(`Simulated draft PR for ${w.branch} → ${w.baseBranch}.`);
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return ok("Copied to clipboard");
      } catch {
        return { ok: false, message: "Clipboard unavailable in this browser.", simulated: true };
      }
    },
  },
};

/** Single swap point for a future Electron adapter. */
export const services: Services = mockServices;
