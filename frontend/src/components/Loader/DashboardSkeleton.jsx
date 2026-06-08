import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="pb-10 h-full w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>

      {/* Analytics Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-80 w-full rounded-3xl col-span-2" />
        <Skeleton className="h-80 w-full rounded-3xl col-span-1" />
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}