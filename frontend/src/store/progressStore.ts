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
      set({ isAnimating: true, progress: 5 }); // Arranca al 5%
      clearInterval(timer);
      // Simulación de avance logarítmico (se frena al 90% esperando el cierre real)
      timer = setInterval(() => {
        set((state) => ({
          progress:
            state.progress >= 90 ? state.progress : state.progress + (10 - state.progress / 10),
        }));
      }, 300);
    },
    setProgress: (value) => {
      set({ isAnimating: true, progress: value });
    },
    done: () => {
      clearInterval(timer);
      set({ progress: 100 });
      // Oculta la barra suavemente tras llegar al 100%
      setTimeout(() => set({ isAnimating: false, progress: 0 }), 400);
    },
  };
});
