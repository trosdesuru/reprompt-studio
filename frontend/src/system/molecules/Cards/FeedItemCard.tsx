import Link from "next/link";
import { IconStack2, IconUser } from "@tabler/icons-react";
import { LazyImage } from "../Media/LazyImage";
import { FeedItem } from "@/src/types/models";

interface FeedItemCardProps {
  item: FeedItem;
  lang: string;
  isPriority?: boolean;
  index?: number;
}

export function FeedItemCard({ item, lang, isPriority = false, index = 0 }: FeedItemCardProps) {
  const href =
    item.type === "prompt"
      ? `/${lang}/${item.username}/p/${item.raw_id || item.id}`
      : `/${lang}/${item.username}/${item.slug}`;

  return (
    <Link
      href={href}
      className="group relative cursor-pointer bg-muted/10 neo-border overflow-hidden aspect-4/5 hover:neo-shadow-accent transition-all block"
    >
      {item.image_url ? (
        <LazyImage
          src={item.image_url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={item.title}
          priority={isPriority}
          index={index}
        />
      ) : (
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
          <img
            src="/logo-white.png"
            className="w-full h-full object-scale-down! dark:hidden opacity-80"
            alt="Portada por defecto"
          />
          <img
            src="/logo-black.png"
            className="w-full h-full object-scale-down hidden dark:block opacity-80"
            alt="Portada por defecto"
          />
        </div>
      )}

      <div className="absolute inset-0 z-20 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="absolute top-3 left-3 flex gap-2">
          {item.type === "collection" && (
            <span className="bg-foreground-600/60 text-blue-200 text-[10px] font-bold px-2 py-1 flex items-center gap-1 neo-border rounded-md shadow-sm">
              <IconStack2 size={12} stroke={2} /> {item.title}
            </span>
          )}
        </div>
        <h3 className="text-white font-bold text-sm truncate shadow-black">{item.title}</h3>
        <div className="flex items-center gap-1.5 mt-1 text-white/80 text-xs font-mono">
          <IconUser size={12} /> @{item.username}
        </div>
      </div>
    </Link>
  );
}
