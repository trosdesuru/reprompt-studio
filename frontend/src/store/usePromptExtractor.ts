import { create } from "zustand";

interface ExtractorState {
  isExtracting: boolean;
  processFiles: (files: File[]) => Promise<void>;
}

export const usePromptExtractor = create<ExtractorState>((set) => ({
  isExtracting: false,

  processFiles: async (files: File[]) => {
    if (!files || files.length === 0) return;

    set({ isExtracting: true });

    try {
      console.log(`📡 Iniciando extracción de ${files.length} archivos...`);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("✅ Extracción simulada con éxito.");
    } catch (error) {
      console.error("❌ Error al procesar archivos:", error);
    } finally {
      set({ isExtracting: false });
    }
  },
}));
