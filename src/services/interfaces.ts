import type { ActionResult, ClaudeSession, CreateWorkspaceInput, Workspace } from "@/types";

/**
 * Service contracts. The browser build uses mock adapters (./mocks);
 * a future Electron build swaps in IPC-backed adapters with the same shape.
 */
export interface WorkspaceService {
  list(): Promise<Workspace[]>;
  getById(id: string): Promise<Workspace>;
  create(input: CreateWorkspaceInput, onStep?: (step: number) => void): Promise<Workspace>;
  rename(id: string, name: string): Promise<void>;
  archive(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  openInIDE(id: string): Promise<ActionResult>;
}

export interface ClaudeService {
  listSessions(workspaceId: string): Promise<ClaudeSession[]>;
  startSession(workspaceId: string, name?: string): Promise<ActionResult>;
  resumeSession(sessionId: string): Promise<ActionResult>;
  resumeLatest(workspaceId: string): Promise<ActionResult>;
  stopSession(sessionId: string): Promise<ActionResult>;
  renameSession(sessionId: string, name: string): Promise<void>;
  archiveSession(sessionId: string): Promise<void>;
}

/** Platform boundary — the only place OS-level actions will live. */
export interface PlatformAdapter {
  openTerminal(path: string): Promise<ActionResult>;
  openIDE(path: string, ide: string): Promise<ActionResult>;
  createPullRequest(workspaceId: string): Promise<ActionResult>;
  copyToClipboard(text: string): Promise<ActionResult>;
}

export interface Services {
  workspaces: WorkspaceService;
  claude: ClaudeService;
  platform: PlatformAdapter;
}
