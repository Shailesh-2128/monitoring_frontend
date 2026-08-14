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
  User as UserIcon,
  BookOpen
} from 'lucide-react'
import { Github } from '../icons/Github'
import { Server } from '../../types/server'
import { Website } from '../../types/website'
import { Database } from '../../types/database'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { TabType } from './Sidebar'

interface HeaderProps {
  activeTab: TabType
  activeServer: Server | null
  activeWebsite: Website | null
  activeDatabase: Database | null
  selectedServerId: number | null
  selectedWebsiteId: number | null
  selectedDatabaseId: number | null
  selectedGithubProjectId?: number | null
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

  const roleName = user?.profile?.role_details?.name || (user?.profile?.is_superadmin ? 'Superadmin / Admin' : 'Viewer')

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-6 flex items-center justify-between shrink-0 font-sans transition-colors duration-200">
      <div className="flex items-center gap-4">
        {hasSelectedItem && onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1 text-xs font-semibold"
            title="Back to Overview Grid"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Overview Grid</span>
          </button>
        )}

        {activeTab === 'iam' ? (
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            Identity & Access Management (IAM) Control Center
          </h2>
        ) : activeTab === 'aws-costing' ? (
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            AWS Costing & Billing Optimization Workspace
          </h2>
        ) : activeTab === 'aws' ? (
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-amber-500" />
            AWS Cloud Infrastructure Monitoring
          </h2>
        ) : activeTab === 'databases' ? (
          selectedDatabaseId !== null && activeDatabase ? (
            <>
              <div className="flex flex-col animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {activeDatabase.project}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold">
                    {activeDatabase.db_type}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DatabaseIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {activeDatabase.name}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-mono font-medium ml-1">
                    (ID: {activeDatabase.id})
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 ml-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeDatabase.latest_check?.status === 'Healthy'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {activeDatabase.latest_check?.status || 'UNHEALTHY'}
                </span>
              </div>
            </>
          ) : (
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Database Monitoring Workspace
            </h2>
          )
        ) : activeTab === 'websites' ? (
          selectedWebsiteId !== null && activeWebsite ? (
            <>
              <div className="flex flex-col animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {activeWebsite.project}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold">
                    Uptime Monitor
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {activeWebsite.name}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-mono font-medium ml-1">
                    (ID: {activeWebsite.id})
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 ml-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeWebsite.latest_check?.status === 'Online'
                      ? 'bg-emerald-500 animate-pulse'
                      : activeWebsite.latest_check?.status === 'SSL Error' ||
                        activeWebsite.latest_check?.status === 'DNS Error'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {activeWebsite.latest_check?.status || 'OFFLINE'}
                </span>
              </div>
            </>
          ) : (
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Website Monitoring Workspace
            </h2>
          )
        ) : activeTab === 'github' ? (
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Github className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            GitHub Projects Workspace
          </h2>
        ) : selectedServerId !== null && activeServer ? (
          <>
            <div className="flex flex-col animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {activeServer.project_name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold">
                  {activeServer.environment}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ServerIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {activeServer.name}
                <span className="text-slate-400 dark:text-slate-500 text-xs font-mono font-medium ml-1">
                  (ID: {activeServer.id})
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 ml-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeServer.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {activeServer.is_online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </>
        ) : (
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Infrastructure Servers Workspace
          </h2>
        )}
      </div>

      <div className="flex items-center gap-3">
        {activeTab === 'servers' && onOpenServerDocs && (
          <button
            onClick={onOpenServerDocs}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
            title="DeployOps Agent Setup & Integration Guide"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Agent Setup Guide</span>
          </button>
        )}

        {/* Read-Only Badge Warning if user does not have write access on current tab */}
        {!isWriteable && activeTab !== 'iam' && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold">
            <span>Read-Only Mode</span>
          </span>
        )}

        {/* Time Range & Action Buttons */}
        {activeTab === 'databases' ? (
          activeDatabase && selectedDatabaseId !== null && (
            <>
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 animate-fadeIn">
                {['1h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedDatabaseId !== null && refreshActiveDatabase(selectedDatabaseId, timeRange)}
                disabled={loadingDetail || isRefreshing}
                className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50"
                title="Manual Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {isWriteable && (
                <button
                  onClick={() => selectedDatabaseId !== null && handleDeleteDatabase(selectedDatabaseId)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-lg text-rose-600 dark:text-rose-400 hover:text-white transition-all ml-1"
                  title="Delete Database Connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )
        ) : activeTab === 'websites' ? (
          activeWebsite && selectedWebsiteId !== null && (
            <>
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 animate-fadeIn">
                {['1h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedWebsiteId !== null && refreshActiveWebsite(selectedWebsiteId, timeRange)}
                disabled={loadingDetail || isRefreshing}
                className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50"
                title="Manual Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {isWriteable && (
                <button
                  onClick={() => selectedWebsiteId !== null && handleDeleteWebsite(selectedWebsiteId)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-lg text-rose-600 dark:text-rose-400 hover:text-white transition-all ml-1"
                  title="Delete Website Monitor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )
        ) : activeTab === 'github' ? (
          selectedGithubProjectId !== null && (
            <>
              {refreshActiveGithubProject && (
                <button
                  onClick={() =>
                    selectedGithubProjectId !== null &&
                    selectedGithubProjectId !== undefined &&
                    refreshActiveGithubProject(selectedGithubProjectId)
                  }
                  disabled={loadingDetail || isRefreshing}
                  className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50"
                  title="Manual Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              {isWriteable && handleDeleteGithubProject && (
                <button
                  onClick={() =>
                    selectedGithubProjectId !== null &&
                    selectedGithubProjectId !== undefined &&
                    handleDeleteGithubProject(selectedGithubProjectId)
                  }
                  className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-lg text-rose-600 dark:text-rose-400 hover:text-white transition-all ml-1"
                  title="Delete GitHub Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )
        ) : activeTab !== 'iam' && activeServer && selectedServerId !== null ? (
          <>
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 animate-fadeIn">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedServerId !== null && refreshActiveServer(selectedServerId, timeRange)}
              disabled={loadingDetail || isRefreshing}
              className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {isWriteable && (
              <button
                onClick={() => selectedServerId !== null && handleDeleteServer(selectedServerId)}
                className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 hover:bg-rose-600 dark:hover:bg-rose-900 rounded-lg text-rose-600 dark:text-rose-400 hover:text-white transition-all ml-1"
                title="Delete Server Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        ) : null}

        {/* User Profile Badge & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold">{roleName}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-amber-500 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
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
