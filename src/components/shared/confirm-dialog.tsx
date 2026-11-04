import { create } from "zustand";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Req {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  input?: { label: string; initial: string };
  resolve: (v: string | boolean) => void;
}
const useConfirmStore = create<{ req: Req | null; set: (r: Req | null) => void }>((set) => ({ req: null, set: (req) => set({ req }) }));

/** Imperative confirm: `await confirm({...})`. Returns false on cancel. */
export function confirm(o: Omit<Req, "resolve" | "input">): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.getState().set({ ...o, resolve: (v) => resolve(Boolean(v)) }));
}
export function prompt(o: Omit<Req, "resolve" | "destructive"> & { input: { label: string; initial: string } }): Promise<string | null> {
  return new Promise((resolve) => useConfirmStore.getState().set({ ...o, resolve: (v) => resolve(typeof v === "string" ? v : null) }));
}

export function ConfirmDialog() {
  const { req, set } = useConfirmStore();
  const [val, setVal] = useState("");
  const close = (v: string | boolean) => {
    req?.resolve(v);
    set(null);
  };
  return (
    <AlertDialog open={!!req} onOpenChange={(o) => { if (!o) close(false); else setVal(req?.input?.initial ?? ""); }}>
      {req && (
        <AlertDialogContent className="rounded-[20px]" onOpenAutoFocus={() => setVal(req.input?.initial ?? "")}>
          <AlertDialogHeader>
            <AlertDialogTitle>{req.title}</AlertDialogTitle>
            <AlertDialogDescription>{req.description}</AlertDialogDescription>
          </AlertDialogHeader>
          {req.input && (
            <form id="prompt-form" onSubmit={(e) => { e.preventDefault(); if (val.trim()) close(val.trim()); }}>
              <label className="mb-1 block text-[12px] text-muted-foreground" htmlFor="prompt-input">{req.input.label}</label>
              <Input id="prompt-input" autoFocus value={val} onChange={(e) => setVal(e.target.value)} />
            </form>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: req.destructive ? "destructive" : "default" })}
              onClick={(e) => { e.preventDefault(); close(req.input ? val.trim() || false : true); }}
            >
              {req.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
