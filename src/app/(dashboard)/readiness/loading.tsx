import { Skeleton, SkeletonStatsGrid, SkeletonChart } from "@/components/ui/skeleton";

export default function ReadinessLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-40" />
      <SkeletonStatsGrid count={4} />
      <SkeletonChart height={260} />
    </div>
  );
}
