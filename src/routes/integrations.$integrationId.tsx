import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmptyState, Field, PreviewNote, SettingsSection } from "@/components/shared/states";
import { IntegrationIcon, integrationStatus } from "@/components/shared/integration-icon";
import { Pill } from "@/components/shared/status-badges";
import { useAppStore } from "@/stores/app-store";
import type { IntegrationId } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/integrations/$integrationId")({
  head: () => ({
    meta: [
      { title: "Integration settings · hello atzlan" },
      { name: "description", content: "Preview configuration for an integration." },
      { property: "og:title", content: "Integration settings · hello atzlan" },
      { property: "og:description", content: "Preview configuration for an integration." },
    ],
  }),
  component: IntegrationDetail,
});

type FieldDef = { label: string; value: string; readOnly?: boolean } | { label: string; toggle: boolean };
const fields: Record<IntegrationId, FieldDef[]> = {
  claude: [{ label: "CLI installation (mock)", value: "Installed", readOnly: true }, { label: "CLI version (mock)", value: "1.0.x-demo", readOnly: true }, { label: "Default model preference", value: "Claude Sonnet (mock)" }, { label: "Session directory (mock)", value: "~/.claude/sessions" }, { label: "Resume last session by default", toggle: true }],
  git: [{ label: "Git installation (mock)", value: "Installed", readOnly: true }, { label: "Git version (mock)", value: "2.4x-demo", readOnly: true }, { label: "Default base branch", value: "main" }, { label: "Worktree directory", value: "~/dev/atzlan/worktrees" }],
  jira: [{ label: "Jira instance URL", value: "https://your-team.atlassian.net" }, { label: "Project mapping", value: "PROJ → Atzlan Core" }, { label: "Sync tickets assigned to me", toggle: true }],
  jenkins: [{ label: "Jenkins instance URL", value: "https://ci.example.com" }, { label: "Job mapping", value: "atzlan-web/{branch}" }],
  mixpanel: [{ label: "Project", value: "Atzlan Production" }, { label: "Default dashboard", value: "Activation funnel" }],
  statsig: [{ label: "Project", value: "atzlan" }, { label: "Environment", value: "development" }],
  contentful: [{ label: "Space", value: "Marketing" }, { label: "Environment", value: "master" }],
};

function IntegrationDetail() {
  const { integrationId } = Route.useParams();
  const i = useAppStore((s) => s.integrations.find((x) => x.id === integrationId));
  if (!i) return <EmptyState title="Integration not found" action={<Button asChild><Link to="/integrations">Back</Link></Button>} />;
  const st = integrationStatus(i.status);
  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-[12.5px] text-muted-foreground"><Link to="/integrations" className="hover:text-foreground">Integrations</Link><ChevronRight className="size-3.5" /><span className="text-foreground">{i.name}</span></nav>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl border bg-card"><IntegrationIcon id={i.id} className="size-6" /></div>
        <div><h1 className="text-[26px] font-bold tracking-tight">{i.name}</h1><Pill tone={st.tone}>{st.label}</Pill></div>
      </div>
      <div className="mb-4"><PreviewNote>Preview functionality — no authentication, tokens or connection tests. Values are not sent anywhere.</PreviewNote></div>
      <SettingsSection title="Configuration" description={i.description}>
        {fields[i.id].map((f) => (
          <Field key={f.label} label={f.label}>
            {"toggle" in f ? <Switch defaultChecked={f.toggle} /> : <Input defaultValue={f.value} readOnly={f.readOnly} className={f.readOnly ? "bg-secondary" : ""} />}
          </Field>
        ))}
        <div className="flex justify-end"><Button onClick={() => toast.success("Preferences saved (preview only)")}>Save preferences</Button></div>
      </SettingsSection>
    </div>
  );
}
