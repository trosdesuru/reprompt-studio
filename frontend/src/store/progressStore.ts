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
      console.log("🚨 [STORE] 🟢 START llamado. Animating: true, Progress: 5");
      set({ isAnimating: true, progress: 5 });
      clearInterval(timer);
      timer = setInterval(() => {
        set((state) => {
          const nextProgress = state.progress >= 90 ? state.progress : state.progress + (10 - state.progress / 10);
          console.log(`🚨 [STORE] ⏱️ Tick del Timer -> Progress: ${nextProgress.toFixed(2)}`);
          return { progress: nextProgress };
        });
      }, 300);
    },
    setProgress: (value) => {
      console.log(`🚨 [STORE] 🔵 setProgress llamado -> Value: ${value}`);
      set({ isAnimating: true, progress: value });
    },
    done: () => {
      console.log("🚨 [STORE] 🔴 DONE llamado. Forzando Progress: 100");
      clearInterval(timer);
      set({ isAnimating: true, progress: 100 });
      setTimeout(() => {
        console.log("🚨 [STORE] 👻 Timeout 400ms terminado. Apagando barra (Animating: false, Progress: 0)");
        set({ isAnimating: false, progress: 0 });
      }, 400);
    },
  };
});
