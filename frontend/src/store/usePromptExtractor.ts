import { create } from 'zustand';
import { useStudioUI } from './useStudioUI';

interface ExtractorState {
  isExtracting: boolean;
  processFiles: (files: File[]) => Promise<void>;
}

export const usePromptExtractor = create<ExtractorState>((set) => ({
  isExtracting: false,
  
  processFiles: async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    const activeDir = useStudioUI.getState().activeDirectoryId;
    set({ isExtracting: true });

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (activeDir) formData.append('directory_id', activeDir);

      try {
        const res = await fetch('/api/prompts/upload-studio', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          console.log(`✅ ${file.name} subida y vectorizada.`);
        }
      } catch (err) {
        console.error(`❌ Error subiendo ${file.name}:`, err);
      }
    }

    set({ isExtracting: false });
    // Aquí podríamos disparar un refresh de la galería
  }
}));