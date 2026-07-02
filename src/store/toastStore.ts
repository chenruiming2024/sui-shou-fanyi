import { create } from "zustand";

interface ToastState {
  message: string | null;
  type: "success" | "error";
  visible: boolean;
  show: (message: string, type?: "success" | "error") => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "success",
  visible: false,
  show: (message, type = "success") => {
    set({ message, type, visible: true });
  },
  hide: () => {
    set({ visible: false, message: null });
  },
}));
