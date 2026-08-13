import Skeleton from "./Skeleton";

export default function ProductFormSkeleton() {
  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-auto custom-scroll">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Description */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>

            {/* Grid: Price and Stock */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            {/* Grid: SKU and Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Button */}
            <div className="pt-4">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
