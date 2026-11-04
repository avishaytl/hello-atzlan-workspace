import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/overview" });
  },
  head: () => ({
    meta: [
      { title: "hello atzlan" },
      { name: "description", content: "One ticket, one workspace, one worktree, many Claude sessions." },
      { property: "og:title", content: "hello atzlan" },
      { property: "og:description", content: "One ticket, one workspace, one worktree, many Claude sessions." },
    ],
  }),
});
