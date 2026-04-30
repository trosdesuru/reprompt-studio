import { forwardRef } from "react";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";

interface FeedSentinelProps {
  isLoading: boolean;
  hasMore: boolean;
  isEmpty: boolean;
}

export const FeedSentinel = forwardRef<HTMLDivElement, FeedSentinelProps>(({ isLoading }, ref) => {
  return (
    <div ref={ref} className="h-32 flex flex-col items-center justify-center mt-10 w-full">
      {isLoading && <FeedState type="loading" />}
    </div>
  );
});

FeedSentinel.displayName = "FeedSentinel";
