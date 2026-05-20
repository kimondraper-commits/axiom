import { Skeleton } from "@/components/ui/skeleton";

export default function AssistantLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-5 w-40" />
      </div>
      {/* Messages area */}
      <div className="flex-1 px-6 py-8 flex flex-col items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full mb-3" />
        <Skeleton className="h-4 w-64 mb-2" />
        <Skeleton className="h-3 w-48" style={{ opacity: 0.5 }} />
      </div>
      {/* Input */}
      <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
