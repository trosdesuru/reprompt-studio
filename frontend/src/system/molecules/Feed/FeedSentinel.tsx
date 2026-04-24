import { forwardRef } from "react";
import { FeedState } from "@/src/system/molecules/Feedback/FeedState";

interface FeedSentinelProps {
  isLoading: boolean;
  hasMore: boolean;
  isEmpty: boolean;
}

export const FeedSentinel = forwardRef<HTMLDivElement, FeedSentinelProps>(
  ({ isLoading, hasMore, isEmpty }, ref) => {
    return (
      <div ref={ref} className="h-32 flex flex-col items-center justify-center mt-10 w-full">
        {isLoading && <FeedState type="loading" />}

        {!hasMore && !isEmpty && !isLoading && (
          <div className="flex items-center gap-4 opacity-50 w-full max-w-md">
            <div className="h-px bg-border flex-1" />
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest text-center whitespace-nowrap">
              Fin de la transmisión
            </p>
            <div className="h-px bg-border flex-1" />
          </div>
        )}
      </div>
    );
  },
);

FeedSentinel.displayName = "FeedSentinel";
