import { create } from 'zustand';

interface ProgressState {
  isWorking: boolean;
  progress: number;
  startWork: () => void;
  stopWork: () => void;
  setProgress: (val: number) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  isWorking: false,
  progress: 0,
  
  // Inicia la barra simulando un progreso automático que frena al 90%
  startWork: () => {
    set({ isWorking: true, progress: 10 });
    // Simulamos avance (esto lo hace parecer "vivo" aunque no sepamos cuánto falta real)
    const interval = setInterval(() => {
      set((state) => {
        if (!state.isWorking) {
          clearInterval(interval);
          return state;
        }
        // Sube rápido al principio, luego se frena al 90% esperando el stopWork
        const next = state.progress + (100 - state.progress) * 0.1;
        return { progress: next > 90 ? 90 : next };
      });
    }, 300);
  },

  // Completa la barra al 100% y la oculta
  stopWork: () => {
    set({ progress: 100 });
    setTimeout(() => {
      set({ isWorking: false, progress: 0 });
    }, 500); // Le damos medio segundo para que el usuario vea que llegó al 100%
  },

  setProgress: (val: number) => set({ progress: val }),
}));
