import React from 'react'
import {
  Server as ServerIcon,
  Globe,
  RefreshCw,
  Trash2,
  Database as DatabaseIcon,
  Cloud,
  Sun,
  Moon,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  LogOut,
  BookOpen
} from 'lucide-react'
import { Github } from '../common/GithubIcon'
import { Server } from '../../types/server'
import { Website } from '../../types/website'
import { Database } from '../../types/database'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { TabType } from './Sidebar'

interface HeaderProps {
  activeTab: TabType
  activeServer: Server | null
  activeWebsite: Website | null
  activeDatabase: Database | null
  selectedServerId: number | null
  selectedWebsiteId: number | null
  selectedDatabaseId: number | null
  selectedGithubProjectId: number | null
  selectedAWSAccountId?: number | null
  timeRange: string
  setTimeRange: (range: string) => void
  isRefreshing: boolean
  loadingDetail: boolean
  refreshActiveServer: (id: number, range: string) => void
  refreshActiveWebsite: (id: number, range: string) => void
  refreshActiveDatabase: (id: number, range: string) => void
  refreshActiveGithubProject?: (id: number) => void
  handleDeleteServer: (id: number) => void
  handleDeleteWebsite: (id: number) => void
  handleDeleteDatabase: (id: number) => void
  handleDeleteGithubProject?: (id: number) => void
  onBackToOverview?: () => void
  onOpenServerDocs?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeServer,
  activeWebsite,
  activeDatabase,
  selectedServerId,
  selectedWebsiteId,
  selectedDatabaseId,
  selectedGithubProjectId,
  selectedAWSAccountId,
  timeRange,
  setTimeRange,
  isRefreshing,
  loadingDetail,
  refreshActiveServer,
  refreshActiveWebsite,
  refreshActiveDatabase,
  refreshActiveGithubProject,
  handleDeleteServer,
  handleDeleteWebsite,
  handleDeleteDatabase,
  handleDeleteGithubProject,
  onBackToOverview,
  onOpenServerDocs
}) => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, hasPermission } = useAuth()

  const hasSelectedItem =
    (activeTab === 'servers' && selectedServerId !== null) ||
    (activeTab === 'websites' && selectedWebsiteId !== null) ||
    (activeTab === 'databases' && selectedDatabaseId !== null) ||
    (activeTab === 'github' && selectedGithubProjectId !== null) ||
    (activeTab === 'aws' && selectedAWSAccountId !== null)

  const isWriteable = hasPermission((activeTab === 'aws-costing' ? 'aws_costing' : activeTab) as any, 'write')
  const roleName = user?.profile?.role_details?.name || (user?.profile?.is_superadmin ? 'Superadmin' : 'Viewer')

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 font-sans transition-colors duration-200 z-30 overflow-hidden">
      {/* Left Section: Compact Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {hasSelectedItem && onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1 text-xs font-semibold shrink-0"
            title="Back to Overview Grid"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>
        )}

        {activeTab === 'iam' ? (
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
            <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>IAM Control Center</span>
          </h2>
        ) : activeTab === 'aws-costing' ? (
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
            <DollarSign className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>AWS Costing Workspace</span>
          </h2>
        ) : activeTab === 'aws' ? (
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
            <Cloud className="w-5 h-5 text-amber-500 shrink-0" />
            <span>AWS Cloud Monitoring</span>
          </h2>
        ) : activeTab === 'databases' ? (
          selectedDatabaseId !== null && activeDatabase ? (
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                {activeDatabase.project}
              </span>
              <span className="text-slate-400 dark:text-slate-600 text-xs hidden sm:inline">/</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                <DatabaseIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{activeDatabase.name}</span>
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                activeDatabase.latest_check?.status === 'Healthy'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeDatabase.latest_check?.status === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {activeDatabase.latest_check?.status || 'UNHEALTHY'}
              </span>
            </div>
          ) : (
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Database Workspace</span>
            </h2>
          )
        ) : activeTab === 'websites' ? (
          selectedWebsiteId !== null && activeWebsite ? (
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                {activeWebsite.project}
              </span>
              <span className="text-slate-400 dark:text-slate-600 text-xs hidden sm:inline">/</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{activeWebsite.name}</span>
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                activeWebsite.latest_check?.status === 'Online'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeWebsite.latest_check?.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {activeWebsite.latest_check?.status || 'OFFLINE'}
              </span>
            </div>
          ) : (
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Website Workspace</span>
            </h2>
          )
        ) : activeTab === 'github' ? (
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>GitHub Workspace</span>
          </h2>
        ) : selectedServerId !== null && activeServer ? (
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
              {activeServer.project_name}
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs hidden sm:inline">/</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <ServerIcon className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{activeServer.name}</span>
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
              activeServer.is_online
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeServer.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {activeServer.is_online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        ) : (
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Infrastructure Workspace</span>
          </h2>
        )}
      </div>

      {/* Right Section: Compact Actions Bar */}
      <div className="flex items-center gap-2 shrink-0">
        {activeTab === 'servers' && onOpenServerDocs && (
          <button
            onClick={onOpenServerDocs}
            className="p-2 sm:px-3 sm:py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            title="monitorInfra Agent Setup Guide"
          >
            <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden md:inline">Agent Setup Guide</span>
          </button>
        )}

        {/* Time Range Selector */}
        {((activeTab === 'servers' && selectedServerId !== null) ||
          (activeTab === 'websites' && selectedWebsiteId !== null) ||
          (activeTab === 'databases' && selectedDatabaseId !== null)) && (
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {(activeTab === 'servers' ? ['1h', '6h', '24h', '7d'] : ['1h', '24h', '7d', '30d']).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}

        {/* Refresh & Delete Actions for Servers */}
        {selectedServerId !== null && activeTab === 'servers' && (
          <>
            <button
              onClick={() => refreshActiveServer(selectedServerId, timeRange)}
              disabled={loadingDetail || isRefreshing}
              className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all disabled:opacity-50"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {isWriteable && (
              <button
                onClick={() => handleDeleteServer(selectedServerId)}
                className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-xl text-rose-600 dark:text-rose-400 hover:text-white transition-all"
                title="Delete Server Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Refresh & Delete Actions for Databases */}
        {selectedDatabaseId !== null && activeTab === 'databases' && activeDatabase && (
          <>
            <button
              onClick={() => refreshActiveDatabase(selectedDatabaseId, timeRange)}
              disabled={loadingDetail || isRefreshing}
              className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all disabled:opacity-50"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {isWriteable && (
              <button
                onClick={() => handleDeleteDatabase(selectedDatabaseId)}
                className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-xl text-rose-600 dark:text-rose-400 hover:text-white transition-all"
                title="Delete Database Connection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Refresh & Delete Actions for Websites */}
        {selectedWebsiteId !== null && activeTab === 'websites' && activeWebsite && (
          <>
            <button
              onClick={() => refreshActiveWebsite(selectedWebsiteId, timeRange)}
              disabled={loadingDetail || isRefreshing}
              className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all disabled:opacity-50"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {isWriteable && (
              <button
                onClick={() => handleDeleteWebsite(selectedWebsiteId)}
                className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-xl text-rose-600 dark:text-rose-400 hover:text-white transition-all"
                title="Delete Website Monitor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800/80">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </span>
              <span className="text-[9px] text-indigo-500 font-semibold uppercase tracking-wider">{roleName}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-amber-500 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  )
}
