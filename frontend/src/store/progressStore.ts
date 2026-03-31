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
        set((state) => ({
          progress: state.progress >= 90 ? state.progress : state.progress + (10 - state.progress / 10),
        }));
      }, 300);
    },
    setProgress: (value) => {
      set({ isAnimating: true, progress: value });
    },
    done: () => {
      clearInterval(timer);
      // 🛡️ FIX CRÍTICO: Forzamos isAnimating a true para que se vea el viaje al 100%
      set({ isAnimating: true, progress: 100 });
      setTimeout(() => {
        set({ isAnimating: false, progress: 0 });
      }, 400);
    },
  };
});
