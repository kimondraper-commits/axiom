import { Skeleton, SkeletonStatsGrid, SkeletonChart } from "@/components/ui/skeleton";

export default function BiodiversityLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-44" />
      <SkeletonStatsGrid count={3} />
      <SkeletonChart height={260} />
    </div>
  );
}
