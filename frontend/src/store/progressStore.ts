import { create } from "zustand";

interface ProgressState {
  isAnimating: boolean;
  progress: number;
  start: () => void;
  setProgress: (value: number) => void;
  done: () => void;
}

export const useProgressStore = create<ProgressState>((set) => {
  let timer: NodeJS.Timeout;

  return {
    isAnimating: false,
    progress: 0,
    start: () => {
      set({ isAnimating: true, progress: 5 });
      clearInterval(timer);
      timer = setInterval(() => {
        set((state) => {
          const nextProgress = state.progress >= 90 ? state.progress : state.progress + (10 - state.progress / 10);
          return { progress: nextProgress };
        });
      }, 300);
    },
    setProgress: (value) => {
      set({ isAnimating: true, progress: value });
    },
    done: () => {
      clearInterval(timer);
      set({ isAnimating: true, progress: 100 });
      setTimeout(() => {
        set({ isAnimating: false, progress: 0 });
      }, 400);
    },
  };
});
