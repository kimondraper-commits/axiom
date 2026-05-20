import { Skeleton, SkeletonTable, SkeletonStatsGrid } from "@/components/ui/skeleton";

export default function LiveDAsLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-7 w-52" />
      <SkeletonStatsGrid count={3} />
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
