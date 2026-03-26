import { useState, useEffect } from "react";
import { api } from "@/src/services/api";

export function FullImageResolver({
  pageUrl,
  index,
}: {
  pageUrl: string;
  index: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(null);
    api.resolverImagen(pageUrl).then((data) => {
      if (data.status === "success") setSrc(data.url_img);
    });
  }, [pageUrl]);

  return (
    <div
      className="flex flex-col items-center max-w-full max-h-full"
      onClick={(e) => e.stopPropagation()}
    >
      {!src ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      ) : (
        <img
          src={src}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          alt="Full view"
        />
      )}
      <div className="mt-4 px-6 py-2 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-400 font-bold">
        PAGE {index}
      </div>
    </div>
  );
}
