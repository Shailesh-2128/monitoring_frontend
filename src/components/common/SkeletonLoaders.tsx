import React from 'react'

export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-1 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/40 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-16 bg-slate-300 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-32 bg-slate-300/80 dark:bg-slate-700/60 rounded"></div>
            </div>
            <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-800"></div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/30 dark:border-slate-800/40">
            <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800/80 rounded"></div>
            <div className="h-2.5 w-12 bg-slate-200 dark:bg-slate-800/80 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Top metric overview cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-300 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-6 rounded-lg bg-indigo-500/20"></div>
            </div>
            <div className="h-8 w-28 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-2.5 w-36 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Large graph skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-48 bg-slate-300 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="h-64 w-full bg-slate-200/70 dark:bg-slate-800/40 rounded-xl flex items-end justify-between p-4 gap-2">
          {[40, 65, 30, 85, 55, 70, 90, 45, 60, 80, 50, 75].map((h, idx) => (
            <div
              key={idx}
              className="w-full bg-indigo-500/20 dark:bg-indigo-500/30 rounded-t-sm"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom details skeleton grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 space-y-3"
          >
            <div className="h-4 w-36 bg-slate-300 dark:bg-slate-800 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800/60 rounded"></div>
              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800/60 rounded"></div>
              <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800/60 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const CategoryTabSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-2 p-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
        />
      ))}
    </div>
  )
}
