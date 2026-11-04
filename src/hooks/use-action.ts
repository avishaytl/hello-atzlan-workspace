import { useState } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/types";

/** Runs a simulated async action with loading state + toast feedback. */
export function useAction() {
  const [pending, setPending] = useState<string | null>(null);
  async function run(key: string, fn: () => Promise<ActionResult | void>, success?: string) {
    setPending(key);
    try {
      const r = await fn();
      if (r && !r.ok) toast.error(r.message, { action: { label: "Retry", onClick: () => run(key, fn, success) } });
      else toast.success(success ?? (r ? r.message : "Done"), r?.simulated ? { description: "Simulated action · preview only" } : undefined);
    } catch {
      toast.error("Unable to complete this simulated action.");
    } finally {
      setPending(null);
    }
  }
  return { pending, run };
}
