import { FeedItem } from "@/src/types/models";

export function getFeedItemUrl(item: FeedItem, lang: string): string {
  if (item.type === "prompt") {
    return `/${lang}/${item.username}/p/${item.raw_id || item.id}`;
  }

  if (item.type === "directory") {
    return `/${lang}/${item.username}/${item.slug}`;
  }

  return `/${lang}/${item.username}`;
}
