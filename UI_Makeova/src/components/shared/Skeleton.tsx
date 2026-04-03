import React from 'react'

interface SkeletonBlockProps {
  className?: string
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-[#F5E8E0] ${className}`.trim()} />
)

interface TableSkeletonProps {
  columns: number
  rows?: number
  compact?: boolean
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 5, compact = false }) => (
  <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
    <div
      className="grid gap-4 px-6 py-3 bg-[#FDF6F2] border-b border-[#F0DDD5]"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns }, (_, index) => (
        <SkeletonBlock key={index} className="h-3 w-20" />
      ))}
    </div>

    <div className="divide-y divide-[#F9F0EC]">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 px-6 py-4 items-center"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <SkeletonBlock
              key={columnIndex}
              className={compact ? 'h-4 w-full max-w-[110px]' : columnIndex === 0 ? 'h-4 w-full max-w-[120px]' : 'h-4 w-full max-w-[90px]'}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

interface StatCardSkeletonProps {
  count?: number
}

export const StatCardSkeletons: React.FC<StatCardSkeletonProps> = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className="bg-white rounded-xl border border-[#F0DDD5] px-5 py-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(196,154,122,0.07)]"
      >
        <SkeletonBlock className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
      </div>
    ))}
  </>
)
