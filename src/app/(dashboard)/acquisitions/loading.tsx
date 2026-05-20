import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function AcquisitionsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <SkeletonTable rows={8} cols={5} />
    </div>
  );
}
