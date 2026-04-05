import { IconPhotoOff } from "@tabler/icons-react";
import { LazyImage } from "../../molecules/Media/LazyImage";
import Image from "next/image";

interface PromptImageViewerProps {
  imageUrl: string | null;
  altText: string;
}

export function PromptImageViewer({ imageUrl, altText }: PromptImageViewerProps) {
  if (!imageUrl) {
    return (
      <div className="w-full aspect-square bg-muted/20 flex flex-col items-center justify-center neo-border rounded-xl">
        <IconPhotoOff size={48} className="text-muted-foreground/50" />
        <span className="text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest">
          Sin imagen adjunta
        </span>
      </div>
    );
  }

  return (
    <div className="w-120px h-fit overflow-hidden neo-border neo-shadow rounded-xl bg-muted/10">
      <Image
        src={imageUrl}
        alt={altText}
        fill
        quality={75}
        className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
      />
    </div>
  );
}
