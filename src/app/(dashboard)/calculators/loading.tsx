import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CalculatorsLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4 mb-4" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
