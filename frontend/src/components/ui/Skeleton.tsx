// frontend/src/components/ui/Skeleton.tsx

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-900 dark:bg-gray-900 ${className}`}
      aria-hidden="true"
    />
  );
}
