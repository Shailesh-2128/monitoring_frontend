import React from 'react'

interface LayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, header, children }) => {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {header}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
