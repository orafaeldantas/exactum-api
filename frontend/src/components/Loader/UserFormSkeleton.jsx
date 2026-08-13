import Skeleton from "./Skeleton";

export default function UserFormSkeleton() {
  return (
    <div className="max-h-[calc(100vh-64px)] overflow-y-auto custom-scroll">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}

          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
