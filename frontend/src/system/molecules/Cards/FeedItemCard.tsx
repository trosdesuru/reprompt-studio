import Link from "next/link";
import { IconStack2, IconUser } from "@tabler/icons-react";
import { FeedItem } from "@/src/features/home/hooks/usePublicFeed";
import { LazyImage } from "../Media/LazyImage";

interface FeedItemCardProps {
  item: FeedItem;
  lang: string;
}

export function FeedItemCard({ item, lang }: FeedItemCardProps) {
  const href =
    item.type === "prompt"
      ? `/${lang}/${item.username}/p/${item.raw_id}`
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
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-mono">
          Sin portada
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="absolute top-3 left-3 flex gap-2">
          {item.type === "collection" && (
            <span className="bg-background/90 text-foreground text-[10px] font-bold px-2 py-1 flex items-center gap-1 neo-border rounded-md shadow-sm">
              <IconStack2 size={12} stroke={2} /> {item.items_count}
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
