import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function ImportLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-32" />
      <SkeletonCard className="flex flex-col items-center py-12">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-64" style={{ opacity: 0.5 }} />
      </SkeletonCard>
    </div>
  );
}
