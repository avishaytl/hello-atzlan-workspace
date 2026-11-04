export type ID = string;

export type WorkspaceStatus = "active" | "paused" | "completed" | "archived";
export type ClaudeState =
  | "not_initialized"
  | "ready"
  | "running"
  | "waiting"
  | "paused"
  | "completed"
  | "error";
export type GitState = "clean" | "dirty" | "ahead" | "ready_for_pr";

export interface Project {
  id: ID;
  name: string;
  key: string;
  description: string;
  archived: boolean;
  updatedAt: string;
}

export interface Repository {
  id: ID;
  projectId: ID;
  name: string;
  path: string;
  defaultBranch: string;
  available: boolean;
}

export interface Workspace {
  id: ID;
  name: string;
  ticketId: ID | null;
  projectId: ID;
  repositoryId: ID;
  branch: string;
  baseBranch: string;
  worktreePath: string;
  status: WorkspaceStatus;
  claudeState: ClaudeState;
  gitState: GitState;
  modifiedFiles: number;
  untrackedFiles: number;
  ahead: number;
  behind: number;
  lastCommit: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  preferredIde: string;
}

export type SessionStatus = "running" | "waiting" | "paused" | "completed" | "error" | "archived";

export interface ClaudeSession {
  id: ID;
  workspaceId: ID;
  name: string;
  model: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  durationMin: number;
  lastMessage: string;
  attention?: string;
}

export type Priority = "highest" | "high" | "medium" | "low";
export type TicketStatus = "To Do" | "In Progress" | "In Review" | "Done";

export interface Ticket {
  id: ID;
  title: string;
  description: string;
  acceptance: string[];
  priority: Priority;
  status: TicketStatus;
  projectId: ID;
  repositoryId: ID;
  assignee: string;
  workspaceId: ID | null;
}

export type ActivityKind = "claude" | "git" | "workspace" | "system";
export interface ActivityEvent {
  id: ID;
  kind: ActivityKind;
  type: string;
  title: string;
  workspaceId: ID | null;
  projectId: ID | null;
  at: string;
}

export type NotificationCategory = "claude" | "git" | "workspace" | "integrations" | "system";
export interface AppNotification {
  id: ID;
  category: NotificationCategory;
  title: string;
  body: string;
  workspaceId: ID | null;
  at: string;
  read: boolean;
}

export type IntegrationId =
  | "claude"
  | "git"
  | "jira"
  | "jenkins"
  | "mixpanel"
  | "statsig"
  | "contentful";
export interface Integration {
  id: IntegrationId;
  name: string;
  description: string;
  status: "demo_connected" | "demo_attention" | "not_configured";
}

export interface ActionResult {
  ok: boolean;
  message: string;
  simulated: true;
}

export interface CreateWorkspaceInput {
  name: string;
  ticketId: ID | null;
  projectId: ID;
  repositoryId: ID;
  description: string;
  baseBranch: string;
  branch: string;
  worktreePath: string;
  createSession: boolean;
  model: string;
}

export interface GitChange {
  path: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  diff: DiffLine[];
}
export interface DiffLine {
  type: "ctx" | "add" | "del" | "hunk";
  text: string;
  oldNo?: number;
  newNo?: number;
}

export interface FileNode {
  name: string;
  type: "file" | "dir";
  children?: FileNode[];
  preview?: string;
}
