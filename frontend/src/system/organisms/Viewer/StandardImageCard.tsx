import { IconDownload, IconCheck, IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  imageUrl: string;
  index: number;
  isSprite: boolean;
  spriteOffset?: string;
  spriteWidth?: number;
  spriteHeight?: number;
  onImageClick: () => void;
  onDownloadClick: () => void;
  downloadStatus: "idle" | "loading" | "success" | "error";
}

export function StandardImageCard({ imageUrl, index, isSprite, spriteOffset, spriteWidth, spriteHeight, onImageClick, onDownloadClick, downloadStatus }: Props) {
  return (
    <div className="relative group cursor-pointer neo-border bg-(--bg-secondary) overflow-hidden aspect-3/4 hover:neo-shadow-accent transition-all">
      <div onClick={onImageClick} className="w-full h-full overflow-hidden bg-black flex items-center justify-center">
        {isSprite ? (
          <div style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: spriteOffset, width: spriteWidth ? `${spriteWidth}px` : '100%', height: spriteHeight ? `${spriteHeight}px` : '100%' }} className="scale-150 transform origin-center" />
        ) : (
          <img src={imageUrl} alt={`Page ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        )}
      </div>
      <div className="absolute top-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-1 neo-border">{index}</div>
      <button onClick={(e) => { e.stopPropagation(); onDownloadClick(); }} disabled={downloadStatus === "loading" || downloadStatus === "success"} className="absolute bottom-2 right-2 p-2 bg-(--accent-color) text-white neo-border opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100">
        {downloadStatus === "loading" ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> :
         downloadStatus === "success" ? <IconCheck size={16} /> :
         downloadStatus === "error" ? <IconAlertTriangle size={16} className="text-red-500" /> :
         <IconDownload size={16} />}
      </button>
    </div>
  );
}
