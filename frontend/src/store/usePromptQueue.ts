import { create } from "zustand";

interface PromptNavigationItem {
  id: string;
  username: string;
}

interface PromptQueueState {
  queue: PromptNavigationItem[];
  setQueue: (items: PromptNavigationItem[]) => void;
  getNextItem: (currentId: string) => PromptNavigationItem | null;
  getPrevItem: (currentId: string) => PromptNavigationItem | null;
}

export const usePromptQueue = create<PromptQueueState>((set, get) => ({
  queue: [],
  setQueue: (items) => set({ queue: items }),

  getNextItem: (currentId) => {
    const { queue } = get();
    const index = queue.findIndex((item) => item.id === String(currentId));
    if (index === -1 || index >= queue.length - 1) return null;
    return queue[index + 1];
  },

  getPrevItem: (currentId) => {
    const { queue } = get();
    const index = queue.findIndex((item) => item.id === String(currentId));
    if (index <= 0) return null;
    return queue[index - 1];
  },
}));
