import { create } from "zustand";

interface UIState {
  paletteOpen: boolean;
  paletteMode: "command" | "search";
  wizardOpen: boolean;
  wizardTicketId: string | null;
  wizardProjectId: string | null;
  hydrated: boolean;
  openPalette: (mode?: "command" | "search") => void;
  setPaletteOpen: (o: boolean) => void;
  openWizard: (opts?: { ticketId?: string; projectId?: string }) => void;
  setWizardOpen: (o: boolean) => void;
  setHydrated: () => void;
}

export const useUI = create<UIState>((set) => ({
  paletteOpen: false,
  paletteMode: "command",
  wizardOpen: false,
  wizardTicketId: null,
  wizardProjectId: null,
  hydrated: false,
  openPalette: (mode = "command") => set({ paletteOpen: true, paletteMode: mode }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  openWizard: (o) => set({ wizardOpen: true, wizardTicketId: o?.ticketId ?? null, wizardProjectId: o?.projectId ?? null }),
  setWizardOpen: (wizardOpen) => set({ wizardOpen }),
  setHydrated: () => set({ hydrated: true }),
}));
