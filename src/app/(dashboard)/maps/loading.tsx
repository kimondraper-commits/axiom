import { Skeleton } from "@/components/ui/skeleton";

export default function MapsLoading() {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <div className="w-72 p-4 space-y-3" style={{ borderRight: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <Skeleton className="h-5 w-28 mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      {/* Map area */}
      <div className="flex-1">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    </div>
  );
}
