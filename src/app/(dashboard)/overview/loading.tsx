import { Skeleton, SkeletonStatsGrid, SkeletonChart } from "@/components/ui/skeleton";

export default function OverviewLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-48" />
      <SkeletonStatsGrid count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart height={280} />
        <SkeletonChart height={280} />
      </div>
    </div>
  );
}
