import type {
  ActivityEvent,
  AppNotification,
  ClaudeSession,
  FileNode,
  GitChange,
  Integration,
  Project,
  Repository,
  Ticket,
  Workspace,
} from "@/types";

/** Deterministic timestamps relative to when demo data is seeded. */
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

export const WORKTREE_ROOT = "~/dev/atzlan/worktrees";

export const seedProjects = (): Project[] => [
  { id: "p-core", key: "PROJ", name: "Atzlan Core", description: "Main web platform, auth and onboarding.", archived: false, updatedAt: ago(5) },
  { id: "p-growth", key: "GRW", name: "Growth Experiments", description: "Feature flags, pricing tests and analytics.", archived: false, updatedAt: ago(60) },
  { id: "p-content", key: "CMS", name: "Content Platform", description: "Contentful models and marketing pages.", archived: false, updatedAt: ago(120) },
  { id: "p-infra", key: "OPS", name: "Delivery Infra", description: "CI pipelines, Jenkins jobs and tooling.", archived: false, updatedAt: ago(1440) },
];

export const seedRepositories = (): Repository[] => [
  { id: "r-web", projectId: "p-core", name: "atzlan-web", path: "~/dev/atzlan/atzlan-web", defaultBranch: "main", available: true },
  { id: "r-api", projectId: "p-core", name: "atzlan-api", path: "~/dev/atzlan/atzlan-api", defaultBranch: "main", available: true },
  { id: "r-flags", projectId: "p-growth", name: "growth-flags", path: "~/dev/atzlan/growth-flags", defaultBranch: "develop", available: true },
  { id: "r-events", projectId: "p-growth", name: "analytics-events", path: "~/dev/atzlan/analytics-events", defaultBranch: "main", available: true },
  { id: "r-cms", projectId: "p-content", name: "content-models", path: "~/dev/atzlan/content-models", defaultBranch: "main", available: true },
  { id: "r-ci", projectId: "p-infra", name: "ci-pipelines", path: "~/dev/atzlan/ci-pipelines", defaultBranch: "master", available: false },
];

type WsSeed = Omit<Workspace, "worktreePath" | "createdAt" | "updatedAt" | "lastOpenedAt" | "baseBranch" | "preferredIde" | "branch"> & { upd: number };
const ws = (w: WsSeed): Workspace => ({
  ...w,
  branch: `feature/${w.ticketId ?? w.id}`,
  baseBranch: "main",
  worktreePath: `${WORKTREE_ROOT}/${w.ticketId ?? w.id}`,
  createdAt: ago(w.upd + 4320),
  updatedAt: ago(w.upd),
  lastOpenedAt: ago(w.upd + 3),
  preferredIde: "Cursor",
});

export const seedWorkspaces = (): Workspace[] => [
  ws({ id: "w-142", name: "Fix authentication flow", ticketId: "PROJ-142", projectId: "p-core", repositoryId: "r-web", status: "active", claudeState: "running", gitState: "dirty", modifiedFiles: 7, untrackedFiles: 2, ahead: 3, behind: 0, lastCommit: "refactor: extract session refresh hook", description: "Token refresh races cause random logouts on Safari.", upd: 5 }),
  ws({ id: "w-156", name: "Improve onboarding", ticketId: "PROJ-156", projectId: "p-core", repositoryId: "r-web", status: "paused", claudeState: "paused", gitState: "dirty", modifiedFiles: 4, untrackedFiles: 0, ahead: 1, behind: 2, lastCommit: "feat: new welcome checklist", description: "Redesign the first-run checklist.", upd: 42 }),
  ws({ id: "w-163", name: "Feature flags for new plans", ticketId: "GRW-163", projectId: "p-growth", repositoryId: "r-flags", status: "active", claudeState: "waiting", gitState: "dirty", modifiedFiles: 3, untrackedFiles: 1, ahead: 2, behind: 0, lastCommit: "chore: add statsig gates for plans", description: "Gate new pricing plans behind Statsig.", upd: 60 }),
  ws({ id: "w-167", name: "Contentful schema update", ticketId: "CMS-167", projectId: "p-content", repositoryId: "r-cms", status: "active", claudeState: "completed", gitState: "ready_for_pr", modifiedFiles: 0, untrackedFiles: 0, ahead: 5, behind: 0, lastCommit: "feat: add hero variant field", description: "Add hero variants to landing model.", upd: 120 }),
  ws({ id: "w-171", name: "Mixpanel events cleanup", ticketId: "GRW-171", projectId: "p-growth", repositoryId: "r-events", status: "completed", claudeState: "completed", gitState: "ready_for_pr", modifiedFiles: 0, untrackedFiles: 0, ahead: 4, behind: 1, lastCommit: "fix: dedupe signup events", description: "Remove deprecated events.", upd: 1440 }),
  ws({ id: "w-174", name: "Rate limit API login", ticketId: "PROJ-174", projectId: "p-core", repositoryId: "r-api", status: "active", claudeState: "error", gitState: "dirty", modifiedFiles: 2, untrackedFiles: 0, ahead: 0, behind: 0, lastCommit: "wip: limiter middleware", description: "Throttle brute-force attempts.", upd: 18 }),
  ws({ id: "w-180", name: "Jenkins parallel test stage", ticketId: "OPS-180", projectId: "p-infra", repositoryId: "r-ci", status: "active", claudeState: "ready", gitState: "clean", modifiedFiles: 0, untrackedFiles: 0, ahead: 0, behind: 0, lastCommit: "Initial worktree", description: "Split tests into parallel shards.", upd: 300 }),
  ws({ id: "w-121", name: "Legacy dashboard removal", ticketId: "PROJ-121", projectId: "p-core", repositoryId: "r-web", status: "archived", claudeState: "completed", gitState: "clean", modifiedFiles: 0, untrackedFiles: 0, ahead: 0, behind: 0, lastCommit: "chore: remove old dashboard", description: "Deleted after migration.", upd: 14400 }),
];

const s = (id: string, workspaceId: string, name: string, status: ClaudeSession["status"], upd: number, dur: number, lastMessage: string, attention?: string): ClaudeSession => ({
  id, workspaceId, name, status, model: id.endsWith("o") ? "Claude Opus (mock)" : "Claude Sonnet (mock)", createdAt: ago(upd + dur), updatedAt: ago(upd), durationMin: dur, lastMessage, attention,
});

export const seedSessions = (): ClaudeSession[] => [
  s("cs-01o", "w-142", "Refactor token refresh", "running", 2, 14, "Updating useSession to retry once before signing out…"),
  s("cs-02", "w-142", "Write auth e2e tests", "completed", 90, 32, "Added 6 Playwright specs covering refresh and logout."),
  s("cs-03", "w-142", "Investigate Safari cookies", "paused", 300, 21, "SameSite=Lax appears to drop cookie on cross-site redirect."),
  s("cs-04", "w-156", "Checklist component", "paused", 42, 48, "Checklist renders; progress persistence still TODO."),
  s("cs-05", "w-156", "Copy review", "completed", 600, 9, "Shortened step descriptions to under 60 chars."),
  s("cs-06o", "w-163", "Plan gating logic", "waiting", 8, 26, "Should the legacy Pro plan be gated or grandfathered?", "Claude is waiting for a decision"),
  s("cs-07", "w-163", "Statsig typings", "completed", 200, 12, "Generated typed gate helpers."),
  s("cs-08", "w-167", "Hero variant field", "completed", 120, 18, "Migration script ready. Recommend review before PR.", "Session is ready for review"),
  s("cs-09", "w-171", "Event audit", "completed", 1440, 40, "Removed 14 deprecated events, updated tracking plan."),
  s("cs-10", "w-171", "Dedupe signup", "archived", 2000, 15, "Fixed double-fire on OAuth signup."),
  s("cs-11", "w-174", "Limiter middleware", "error", 18, 11, "Simulated test run failed: 2 failing specs in limiter.test.ts", "A simulated operation failed"),
  s("cs-12", "w-174", "Redis store spike", "paused", 400, 25, "Comparing in-memory vs Redis token bucket."),
  s("cs-13o", "w-142", "Session expiry UX", "running", 6, 7, "Drafting a toast that warns before session expiry…"),
  s("cs-14", "w-121", "Remove legacy routes", "archived", 14400, 30, "All legacy routes removed and redirects added."),
  s("cs-15", "w-167", "Contentful preview fix", "paused", 500, 14, "Preview URL now respects locale."),
];

const t = (id: string, title: string, priority: Ticket["priority"], status: Ticket["status"], projectId: string, repositoryId: string, workspaceId: string | null, description: string): Ticket => ({
  id, title, priority, status, projectId, repositoryId, workspaceId, description, assignee: "Avishay Tal",
  acceptance: ["Behaviour covered by automated tests", "No regression in existing flows", "Reviewed by one teammate"],
});

export const seedTickets = (): Ticket[] => [
  t("PROJ-142", "Fix authentication flow", "highest", "In Progress", "p-core", "r-web", "w-142", "Users get logged out randomly when the access token refreshes concurrently."),
  t("PROJ-156", "Improve onboarding", "high", "In Progress", "p-core", "r-web", "w-156", "Replace the onboarding modal with a persistent checklist."),
  t("GRW-163", "Feature flags for new plans", "high", "In Progress", "p-growth", "r-flags", "w-163", "Gate Team and Scale plans behind Statsig gates."),
  t("CMS-167", "Contentful schema update", "medium", "In Review", "p-content", "r-cms", "w-167", "Add hero variant field to landing page model."),
  t("GRW-171", "Mixpanel events cleanup", "low", "In Review", "p-growth", "r-events", "w-171", "Remove deprecated events and update the tracking plan."),
  t("PROJ-174", "Rate limit API login", "highest", "In Progress", "p-core", "r-api", "w-174", "Add per-IP and per-account throttling to /login."),
  t("OPS-180", "Jenkins parallel test stage", "medium", "To Do", "p-infra", "r-ci", "w-180", "Split the test stage into 4 parallel shards."),
  t("PROJ-121", "Legacy dashboard removal", "low", "Done", "p-core", "r-web", "w-121", "Delete the old dashboard after migration."),
  t("PROJ-188", "Password reset emails", "high", "To Do", "p-core", "r-api", null, "Resend password reset emails via the new mail provider."),
  t("GRW-190", "Pricing page A/B test", "medium", "To Do", "p-growth", "r-flags", null, "Test annual-first pricing toggle."),
  t("CMS-193", "Blog author pages", "low", "To Do", "p-content", "r-cms", null, "Add author model and pages."),
  t("OPS-195", "Cache node_modules in CI", "medium", "To Do", "p-infra", "r-ci", null, "Reduce pipeline time by caching dependencies."),
];

const e = (id: number, kind: ActivityEvent["kind"], type: string, title: string, workspaceId: string | null, projectId: string | null, min: number): ActivityEvent => ({ id: `e-${id}`, kind, type, title, workspaceId, projectId, at: ago(min) });

export const seedActivity = (): ActivityEvent[] => [
  e(1, "claude", "session_started", "Claude started “Refactor token refresh”", "w-142", "p-core", 2),
  e(2, "git", "changes_detected", "7 files modified in PROJ-142", "w-142", "p-core", 5),
  e(3, "claude", "session_started", "Claude started “Session expiry UX”", "w-142", "p-core", 6),
  e(4, "claude", "session_waiting", "Claude is waiting for input in GRW-163", "w-163", "p-growth", 8),
  e(5, "claude", "session_completed", "Claude completed a refactor", "w-142", "p-core", 10),
  e(6, "system", "build_failed", "Mock test run failed in PROJ-174", "w-174", "p-core", 18),
  e(7, "git", "commit", "Branch updated (3 commits)", "w-142", "p-core", 22),
  e(8, "claude", "session_started", "Claude started working on the task", "w-142", "p-core", 24),
  e(9, "workspace", "workspace_paused", "Workspace PROJ-156 paused", "w-156", "p-core", 42),
  e(10, "git", "commit", "feat: new welcome checklist", "w-156", "p-core", 50),
  e(11, "workspace", "workspace_opened", "Opened GRW-163 in Cursor (simulated)", "w-163", "p-growth", 61),
  e(12, "git", "commit", "chore: add statsig gates for plans", "w-163", "p-growth", 75),
  e(13, "claude", "session_completed", "Claude finished “Write auth e2e tests”", "w-142", "p-core", 90),
  e(14, "system", "build_completed", "Mock build #482 completed", "w-167", "p-content", 110),
  e(15, "claude", "session_completed", "Claude finished “Hero variant field”", "w-167", "p-content", 120),
  e(16, "git", "commit", "feat: add hero variant field", "w-167", "p-content", 125),
  e(17, "workspace", "task_linked", "CMS-167 linked to workspace", "w-167", "p-content", 180),
  e(18, "claude", "session_completed", "Claude finished “Statsig typings”", "w-163", "p-growth", 200),
  e(19, "workspace", "workspace_created", "Workspace OPS-180 created", "w-180", "p-infra", 300),
  e(20, "claude", "session_paused", "Session “Investigate Safari cookies” paused", "w-142", "p-core", 300),
  e(21, "claude", "session_paused", "Session “Redis store spike” paused", "w-174", "p-core", 400),
  e(22, "claude", "session_paused", "Session “Contentful preview fix” paused", "w-167", "p-content", 500),
  e(23, "claude", "session_completed", "Claude finished “Copy review”", "w-156", "p-core", 600),
  e(24, "system", "build_completed", "Mock build #479 completed", "w-171", "p-growth", 900),
  e(25, "git", "commit", "fix: dedupe signup events", "w-171", "p-growth", 1300),
  e(26, "claude", "session_completed", "Claude finished “Event audit”", "w-171", "p-growth", 1440),
  e(27, "workspace", "workspace_completed", "Workspace GRW-171 marked completed", "w-171", "p-growth", 1500),
  e(28, "workspace", "workspace_created", "Workspace PROJ-174 created", "w-174", "p-core", 2900),
  e(29, "workspace", "task_linked", "PROJ-142 linked to workspace", "w-142", "p-core", 4325),
  e(30, "workspace", "workspace_archived", "Workspace PROJ-121 archived", "w-121", "p-core", 10000),
];

export const seedNotifications = (): AppNotification[] => [
  { id: "n1", category: "claude", title: "Claude is waiting for input", body: "GRW-163 · Plan gating logic needs a decision.", workspaceId: "w-163", at: ago(8), read: false },
  { id: "n2", category: "system", title: "Simulated test run failed", body: "PROJ-174 · 2 failing specs in limiter.test.ts", workspaceId: "w-174", at: ago(18), read: false },
  { id: "n3", category: "workspace", title: "Workspace CMS-167 is ready for PR", body: "5 commits ahead of main.", workspaceId: "w-167", at: ago(120), read: false },
  { id: "n4", category: "integrations", title: "Mock build completed successfully", body: "Jenkins demo job #482", workspaceId: "w-167", at: ago(110), read: true },
  { id: "n5", category: "git", title: "PROJ-156 is 2 commits behind main", body: "Consider rebasing before resuming.", workspaceId: "w-156", at: ago(240), read: true },
];

export const seedIntegrations = (): Integration[] => [
  { id: "claude", name: "Claude Code", description: "AI coding sessions per workspace.", status: "demo_connected" },
  { id: "git", name: "Git", description: "Branches and worktrees for every task.", status: "demo_connected" },
  { id: "jira", name: "Jira", description: "Sync tickets into My Tasks.", status: "demo_connected" },
  { id: "jenkins", name: "Jenkins", description: "Build status for workspace branches.", status: "demo_attention" },
  { id: "mixpanel", name: "Mixpanel", description: "Product analytics dashboards.", status: "demo_connected" },
  { id: "statsig", name: "Statsig", description: "Feature gates and experiments.", status: "demo_connected" },
  { id: "contentful", name: "Contentful", description: "Content models and environments.", status: "not_configured" },
];

/** Sample read-only diffs reused for every workspace in the mock viewer. */
export const sampleChanges: GitChange[] = [
  {
    path: "src/auth/useSession.ts", status: "modified", additions: 9, deletions: 3,
    diff: [
      { type: "hunk", text: "@@ -12,10 +12,16 @@ export function useSession() {" },
      { type: "ctx", text: "  const [session, setSession] = useState<Session | null>(null);", oldNo: 12, newNo: 12 },
      { type: "del", text: "  const refresh = () => api.refresh().then(setSession);", oldNo: 13 },
      { type: "add", text: "  const inflight = useRef<Promise<Session> | null>(null);", newNo: 13 },
      { type: "add", text: "  const refresh = async () => {", newNo: 14 },
      { type: "add", text: "    inflight.current ??= api.refresh();", newNo: 15 },
      { type: "add", text: "    try {", newNo: 16 },
      { type: "add", text: "      setSession(await inflight.current);", newNo: 17 },
      { type: "add", text: "    } finally {", newNo: 18 },
      { type: "add", text: "      inflight.current = null;", newNo: 19 },
      { type: "add", text: "    }", newNo: 20 },
      { type: "add", text: "  };", newNo: 21 },
      { type: "ctx", text: "", oldNo: 14, newNo: 22 },
      { type: "del", text: "  if (expired) signOut();", oldNo: 15 },
      { type: "del", text: "  return session;", oldNo: 16 },
      { type: "add", text: "  return { session, refresh };", newNo: 23 },
      { type: "ctx", text: "}", oldNo: 17, newNo: 24 },
    ],
  },
  {
    path: "src/auth/refreshQueue.ts", status: "added", additions: 6, deletions: 0,
    diff: [
      { type: "hunk", text: "@@ -0,0 +1,6 @@" },
      { type: "add", text: "export class RefreshQueue {", newNo: 1 },
      { type: "add", text: "  private pending: Array<() => void> = [];", newNo: 2 },
      { type: "add", text: "  enqueue(fn: () => void) { this.pending.push(fn); }", newNo: 3 },
      { type: "add", text: "  flush() { this.pending.splice(0).forEach((f) => f()); }", newNo: 4 },
      { type: "add", text: "}", newNo: 5 },
      { type: "add", text: "", newNo: 6 },
    ],
  },
  {
    path: "src/legacy/cookieShim.js", status: "deleted", additions: 0, deletions: 4,
    diff: [
      { type: "hunk", text: "@@ -1,4 +0,0 @@" },
      { type: "del", text: "// TODO remove after Safari 15", oldNo: 1 },
      { type: "del", text: "export function patchCookies() {", oldNo: 2 },
      { type: "del", text: "  document.cookie = document.cookie;", oldNo: 3 },
      { type: "del", text: "}", oldNo: 4 },
    ],
  },
];

export const sampleTree: FileNode[] = [
  { name: "src", type: "dir", children: [
    { name: "auth", type: "dir", children: [
      { name: "useSession.ts", type: "file", preview: "export function useSession() {\n  const inflight = useRef(null);\n  // …\n}" },
      { name: "refreshQueue.ts", type: "file", preview: "export class RefreshQueue {\n  // …\n}" },
    ] },
    { name: "components", type: "dir", children: [
      { name: "LoginForm.tsx", type: "file", preview: "export function LoginForm() {\n  return <form>…</form>;\n}" },
      { name: "SessionToast.tsx", type: "file", preview: "export function SessionToast() {\n  return null;\n}" },
    ] },
    { name: "main.tsx", type: "file", preview: "createRoot(el).render(<App />);" },
  ] },
  { name: "tests", type: "dir", children: [{ name: "auth.spec.ts", type: "file", preview: "test('refreshes once', async () => {\n  // …\n});" }] },
  { name: "package.json", type: "file", preview: '{\n  "name": "atzlan-web",\n  "private": true\n}' },
  { name: "CLAUDE.md", type: "file", preview: "# Workspace instructions\n- Prefer small commits\n- Run tests before PR" },
];
