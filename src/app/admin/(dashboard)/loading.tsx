export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-48 bg-wood-200 dark:bg-timber-800 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-wood-100 dark:bg-timber-900 rounded" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-wood-100 dark:bg-timber-800" />
            <div>
              <div className="h-3 w-20 bg-wood-100 dark:bg-timber-800 rounded mb-2" />
              <div className="h-6 w-12 bg-wood-200 dark:bg-timber-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 p-6">
        <div className="h-5 w-40 bg-wood-200 dark:bg-timber-800 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-5 h-5 rounded bg-wood-100 dark:bg-timber-800" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-wood-100 dark:bg-timber-800 rounded mb-2" />
                <div className="h-3 w-1/2 bg-wood-50 dark:bg-timber-900 rounded" />
              </div>
              <div className="h-5 w-16 bg-wood-100 dark:bg-timber-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
