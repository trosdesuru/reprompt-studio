// frontend/src/components/GalleryCard/GalleryCardSkeleton.tsx

export function GalleryCardSkeleton() {
  return (
    <article className="flex flex-col bg-(--bg-secondary) neo-border neo-shadow h-full overflow-hidden">
      {/* 🖼️ Placeholder de la Imagen (Pulsando) */}
      <div className="h-64 sm:h-56 bg-gray-200 border-b-[3px] border-(--border-color) animate-pulse flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* 📝 Placeholder del Texto y Botón */}
      <div className="p-4 flex flex-col grow bg-(--bg-secondary) gap-3">
        {/* Líneas de título simuladas */}
        <div className="h-4 bg-gray-300 w-full animate-pulse"></div>
        <div className="h-4 bg-gray-300 w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-300 w-1/2 animate-pulse mb-4"></div>

        {/* Botón simulado */}
        <div className="mt-auto h-11 bg-gray-200 border-[3px] border-dashed border-gray-400 w-full flex items-center justify-center">
           <div className="h-2 w-16 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </article>
  );
}