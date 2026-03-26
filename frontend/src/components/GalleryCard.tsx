import { GalleryItem } from "../types/gallery";

interface Props {
  item: GalleryItem;
  onDownloadTotal: (url: string, title: string) => void;
  onOpenVisor: (url: string, title: string) => void;
}

export default function GalleryCard({ item, onDownloadTotal, onOpenVisor }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
      <div className="h-64 overflow-hidden bg-gray-900">
        {item.thumb && item.thumb !== "N/A" ? (
          <img
            src={item.thumb}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">Sin foto</div>
        )}
      </div>
      <div className="p-4 flex flex-col grow justify-between">
        <h2 className="text-sm font-bold text-gray-200 line-clamp-2 mb-4" title={item.title}>
          {item.title}
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onDownloadTotal(item.url, item.title)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-sm"
          >
            ⬇️ Bajar Galería
          </button>
          <button
            onClick={() => onOpenVisor(item.url, item.title)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm"
          >
            📖 Abrir Visor
          </button>
        </div>
      </div>
    </div>
  );
}
