import { create } from "zustand";

interface PromptQueueState {
  queue: string[];
  setQueue: (ids: string[]) => void;
  getNextId: (currentId: string) => string | null;
  getPrevId: (currentId: string) => string | null;
}

export const usePromptQueue = create<PromptQueueState>((set, get) => ({
  queue: [],

  setQueue: (ids) => set({ queue: ids }),

  getNextId: (currentId) => {
    const { queue } = get();
    const index = queue.indexOf(String(currentId));
    if (index === -1 || index >= queue.length - 1) return null;
    return queue[index + 1];
  },

  getPrevId: (currentId) => {
    const { queue } = get();
    const index = queue.indexOf(String(currentId));
    if (index <= 0) return null;
    return queue[index - 1];
  },
}));
