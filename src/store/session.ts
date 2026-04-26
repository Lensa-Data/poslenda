import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  /** Crypto token linking this browser to an active table session */
  sessionToken: string | null;
  /** The active order number (e.g., POSLENDA-XXXX) */
  activeOrderNumber: string | null;
  /** The active order's internal ID */
  activeOrderId: string | null;
  /** The table ID this session is bound to */
  activeTableId: string | null;
  /** Whether zustand has rehydrated from localStorage */
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  setSession: (data: {
    sessionToken: string;
    orderNumber: string;
    orderId?: string;
    tableId?: string;
  }) => void;
  clearSession: () => void;
  hasActiveSession: () => boolean;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      activeOrderNumber: null,
      activeOrderId: null,
      activeTableId: null,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setSession: (data) =>
        set({
          sessionToken: data.sessionToken,
          activeOrderNumber: data.orderNumber,
          activeOrderId: data.orderId ?? null,
          activeTableId: data.tableId ?? null,
        }),

      clearSession: () =>
        set({
          sessionToken: null,
          activeOrderNumber: null,
          activeOrderId: null,
          activeTableId: null,
        }),

      hasActiveSession: () => {
        const state = get();
        return !!(state.sessionToken && state.activeOrderNumber);
      },
    }),
    {
      name: "poslenda-session",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
