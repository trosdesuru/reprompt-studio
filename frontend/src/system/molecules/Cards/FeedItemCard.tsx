import Link from "next/link";
import { IconStack2 } from "@tabler/icons-react";
import { LazyImage } from "../Media/LazyImage";
import { FeedItem } from "@/src/types/models";
import { getFeedItemUrl } from "@/src/utils/lib/routes";
import { ImageDebugOverlay } from "../../atoms/Debug/ImageDebugOverlay";
import { getBoundedAspectRatio } from "@/src/utils/lib/media";
import { UserAvatar } from "../../atoms/Avatar/Avatar";
import { usePromptQueue } from "@/src/store/usePromptQueue";

interface FeedItemCardProps {
  item: FeedItem;
  lang: string;
  isPriority?: boolean;
  index?: number;
  queueIds?: string[];
}

export function FeedItemCard({
  item,
  lang,
  isPriority = false,
  index = 0,
  queueIds = [],
}: FeedItemCardProps) {
  const setQueue = usePromptQueue((state) => state.setQueue);
  const href = getFeedItemUrl(item, lang);

  const boundedRatio = getBoundedAspectRatio(item.width, item.height, item.resolution);

  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 [FEED ITEM DEBUG: @${item.username}]`, {
      id: item.id,
      username: item.username,
      avatarUrl: item.avatar_url,
      fullItem: item,
    });
  }

  return (
    <Link
      href={href}
      className="group relative cursor-pointer bg-muted/10 neo-border overflow-hidden block transition-all hover:neo-shadow-accent w-full"
      style={{ aspectRatio: boundedRatio }}
      onClick={() => {
        if (queueIds.length > 0) {
          setQueue(queueIds);
        }
      }}
    >
      <ImageDebugOverlay
        id={item.raw_id || item.id}
        width={item.width}
        height={item.height}
        resolution={item.resolution}
      />

      {item.image_url ? (
        <LazyImage
          src={item.image_url}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          alt={item.title}
          priority={isPriority}
          index={index}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background group-hover:scale-105 transition-transform duration-500">
          <img
            src="/logo-brand-black.svg"
            className="w-1/2 h-auto object-contain dark:hidden opacity-30"
            alt="Cover"
          />
          <img
            src="/logo-brand-white.svg"
            className="w-1/2 h-auto object-contain hidden dark:block opacity-30"
            alt="Cover"
          />
        </div>
      )}

      <div className="absolute inset-0 z-20 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="absolute top-3 left-3 flex gap-2">
          {item.type === "directory" && (
            <span className="bg-black/60 backdrop-blur-sm text-blue-300 text-[10px] font-bold px-2 py-1 flex items-center gap-1 neo-border border-blue-500/30 rounded-md shadow-sm">
              <IconStack2 size={12} stroke={2} /> Colección
            </span>
          )}
        </div>

        <h3 className="text-white font-bold text-sm truncate shadow-black drop-shadow-md">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-white/80 text-xs font-mono">
          <UserAvatar size="xs" username={item.username} avatarUrl={item.avatar_url} />@
          {item.username}
        </div>
      </div>
    </Link>
  );
}
