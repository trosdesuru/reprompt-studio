import { FeedItemCard } from "@/src/system/molecules/Cards/FeedItemCard";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";
import { FeedItem } from "@/src/features/home/hooks/usePublicFeed";
import { FadeIn } from "../../atoms/FadeIn";

interface PublicFeedGridProps {
  feed: FeedItem[];
  isLoading: boolean;
  lang: string;
}

export function PublicFeedGrid({ feed, isLoading, lang }: PublicFeedGridProps) {
  return (
    <div className="pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-black font-mono uppercase tracking-widest text-(--accent-color)">
          Explora la Comunidad
        </h2>
      </div>
      {isLoading ? (
        <FeedState type="loading" />
      ) : feed.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 text-muted-foreground font-mono neo-border bg-muted/5">
            Aún no hay arte público en la plataforma con estos filtros.
          </div>
        </FadeIn>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {feed.map((item, index) => (
            <FadeIn key={item.id} delay={index * 0.05} y={20}>
              <FeedItemCard key={item.id} item={item} lang={lang} isPriority={index < 6} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
