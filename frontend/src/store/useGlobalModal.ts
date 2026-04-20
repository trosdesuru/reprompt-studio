import { create } from "zustand";

type ModalType = "info" | "warning" | "danger" | "success";

interface ModalConfig {
  title: string;
  message: React.ReactNode | string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface GlobalModalState {
  isOpen: boolean;
  config: ModalConfig | null;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export const useGlobalModal = create<GlobalModalState>((set) => ({
  isOpen: false,
  config: null,

  openModal: (config) => set({ isOpen: true, config: { type: "info", ...config } }),

  closeModal: () => set({ isOpen: false }),
}));
