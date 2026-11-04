import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNote } from "@/components/shared/states";
import { IntegrationIcon, integrationStatus } from "@/components/shared/integration-icon";
import { StatusDot } from "@/components/shared/status-badges";
import { useAppStore } from "@/stores/app-store";

export const Route = createFileRoute("/integrations/")({
  head: () => ({
    meta: [
      { title: "Integrations · hello atzlan" },
      { name: "description", content: "Claude Code, Git, Jira, Jenkins and more — demo configuration." },
      { property: "og:title", content: "Integrations · hello atzlan" },
      { property: "og:description", content: "Claude Code, Git, Jira, Jenkins and more — demo configuration." },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const integrations = useAppStore((s) => s.integrations);
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader glow title="Integrations" subtitle="Connect the tools around your workspaces." />
      <div className="mb-4"><PreviewNote>All statuses below are demo data. No real connections are made in this preview.</PreviewNote></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => {
          const st = integrationStatus(i.status);
          return (
            <div key={i.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary"><IntegrationIcon id={i.id} className="size-5" /></div>
                <div className="flex-1"><h2 className="text-[16px] font-semibold">{i.name}</h2><p className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><StatusDot tone={st.tone} label={st.label} />{st.label}</p></div>
              </div>
              <p className="mt-3 flex-1 text-[13px] text-muted-foreground">{i.description}</p>
              <Button asChild variant="outline" className="mt-4"><Link to="/integrations/$integrationId" params={{ integrationId: i.id }}>Configure</Link></Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
