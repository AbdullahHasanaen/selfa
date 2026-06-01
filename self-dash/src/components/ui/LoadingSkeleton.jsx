export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-700 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-10 bg-surface-700/60 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-surface-800 border border-surface-700 rounded-xl p-5 space-y-4">
      <div className="h-5 bg-surface-700 rounded w-1/3" />
      <div className="h-8 bg-surface-700 rounded w-1/2" />
      <div className="h-4 bg-surface-700/60 rounded w-2/3" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-surface-700 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
        <TableSkeleton />
      </div>
    </div>
  )
}
