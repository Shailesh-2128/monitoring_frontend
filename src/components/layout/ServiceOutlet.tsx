import {
  Server as ServerIcon,
  Globe,
  Database as DatabaseIcon,
  Cloud,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Download,
  Upload
} from 'lucide-react'
import { Github } from '../icons/Github'
import { Server } from '../../types/server'
import { Website } from '../../types/website'
import { Database } from '../../types/database'
import { GitHubProject } from '../../types/github'
import { AWSAccount } from '../../types/aws'

interface ServiceOutletProps {
  activeTab: 'servers' | 'websites' | 'databases' | 'github' | 'aws' | 'aws-costing'
  servers: Server[]
  filteredServers: Server[]
  websites: Website[]
  filteredWebsites: Website[]
  databases: Database[]
  filteredDatabases: Database[]
  githubProjects: GitHubProject[]
  filteredGithubProjects: GitHubProject[]
  awsAccounts?: AWSAccount[]
  filteredAWSAccounts?: AWSAccount[]
  selectedServerId: number | null
  selectedWebsiteId: number | null
  selectedDatabaseId: number | null
  selectedGithubProjectId: number | null
  selectedAWSAccountId?: number | null
  setSelectedServerId: (id: number | null) => void
  setSelectedWebsiteId: (id: number | null) => void
  setSelectedDatabaseId: (id: number | null) => void
  setSelectedGithubProjectId: (id: number | null) => void
  setSelectedAWSAccountId?: (id: number | null) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  onAddServer: () => void
  onAddWebsite: () => void
  onAddDatabase: () => void
  onAddGithub: () => void
  onAddAWS?: () => void
  onOpenServerDocs?: () => void
  onExportBackup?: (db: Database) => void
  onImportBackup?: (db: Database) => void
}

export const ServiceOutletOverview: React.FC<ServiceOutletProps> = (props) => {
  const {
    activeTab,
    servers = [],
    filteredServers = [],
    websites = [],
    filteredWebsites = [],
    databases = [],
    filteredDatabases = [],
    githubProjects: _githubProjects = [],
    filteredGithubProjects = [],
    awsAccounts: _awsAccounts = [],
    filteredAWSAccounts = [],
    setSelectedServerId,
    setSelectedWebsiteId,
    setSelectedDatabaseId,
    setSelectedGithubProjectId,
    setSelectedAWSAccountId,
    searchQuery,
    setSearchQuery,
    onAddServer,
    onAddWebsite,
    onAddDatabase,
    onAddGithub,
    onAddAWS,
    onOpenServerDocs,
    onExportBackup,
    onImportBackup
  } = props

  const safeServers = servers || []
  const safeFilteredServers = filteredServers || []

  if (activeTab === 'servers') {
    const totalCount = safeServers.length
    const onlineCount = safeServers.filter((s) => s?.is_online).length
    const offlineCount = totalCount - onlineCount

    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ServerIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Servers Monitoring Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select any infrastructure node to view real-time CPU, RAM, Disk, process list & system log telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onOpenServerDocs && (
              <button
                onClick={onOpenServerDocs}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Agent Documentation</span>
              </button>
            )}

            <button
              onClick={onAddServer}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Server Node</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Nodes</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ServerIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Online & Healthy</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{onlineCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Offline / Warning</span>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{offlineCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Filter server nodes by name, IP, environment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Server Cards Grid */}
        {safeFilteredServers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <ServerIcon className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No server nodes found matching your query.</p>
            <button
              onClick={onAddServer}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              + Add Your First Server
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {safeFilteredServers.map((server) => (
              <div
                key={server.id}
                onClick={() => setSelectedServerId(server.id)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 truncate pr-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-mono">
                      {server.project_name}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {server.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      IP: {server.public_ip || 'No Public IP'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${
                      server.is_online
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${server.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {server.is_online ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                {server.latest_reading ? (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">CPU</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                        {server.latest_reading.cpu.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">RAM</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                        {server.latest_reading.ram.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">DISK</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                        {server.latest_reading.disk.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 italic">
                    Waiting for agent telemetry reports...
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    {server.environment}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (activeTab === 'websites') {
    const safeWebsites = websites || []
    const safeFilteredWebsites = filteredWebsites || []
    const totalCount = safeWebsites.length
    const onlineCount = safeWebsites.filter((w) => w?.latest_check?.status === 'Online').length
    const issueCount = totalCount - onlineCount

    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Website Monitoring Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time HTTP Uptime probes, response speed analytics, SSL certification & DNS status.
            </p>
          </div>

          <button
            onClick={onAddWebsite}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Website Probe</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Probes</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Online Probes</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{onlineCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Issues / Offline</span>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{issueCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Filter websites by name, URL, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Website Cards Grid */}
        {safeFilteredWebsites.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Globe className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No website probes found matching your filter.</p>
            <button
              onClick={onAddWebsite}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              + Add Your First Website Probe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {safeFilteredWebsites.map((web) => {
              const status = web.latest_check?.status || 'Offline'
              const statusColor =
                status === 'Online'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'

              return (
                <div
                  key={web.id}
                  onClick={() => setSelectedWebsiteId(web.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 truncate pr-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-mono">
                        {web.project}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {web.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate select-all">
                        {web.url}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border flex items-center gap-1.5 ${statusColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Response Time</span>
                      <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {web.latest_check?.response_time ? `${web.latest_check.response_time.toFixed(0)} ms` : '-- ms'}
                      </span>
                    </div>

                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">SSL Certificate</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        {web.latest_check?.ssl_valid ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Valid SSL</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span>No SSL / Alert</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      Check every {web.check_interval}s
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Uptime &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (activeTab === 'databases') {
    const safeDatabases = databases || []
    const safeFilteredDatabases = filteredDatabases || []
    const totalCount = safeDatabases.length
    const healthyCount = safeDatabases.filter((d) => d?.latest_check?.status === 'Healthy').length
    const unhealthyCount = totalCount - healthyCount

    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DatabaseIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Database Monitoring Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active TCP ping & connection probes for PostgreSQL, Supabase, MySQL, Redis, and MongoDB databases.
            </p>
          </div>

          <button
            onClick={onAddDatabase}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Database Target</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Databases</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DatabaseIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Healthy Connections</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{healthyCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Unhealthy / Error</span>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{unhealthyCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Filter databases by name, type, host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Database Cards Grid */}
        {safeFilteredDatabases.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <DatabaseIcon className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No database targets found matching your filter.</p>
            <button
              onClick={onAddDatabase}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              + Add Database Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {safeFilteredDatabases.map((db) => {
              const status = db.latest_check?.status || 'Unhealthy'
              const statusColor =
                status === 'Healthy'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'

              return (
                <div
                  key={db.id}
                  onClick={() => setSelectedDatabaseId(db.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 truncate pr-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-mono">
                        {db.project}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {db.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate select-all">
                        Host: {db.host}:{db.port}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border flex items-center gap-1.5 ${statusColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Engine / Type</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                        {db.db_type}
                      </span>
                    </div>

                    <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Response Time</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {db.latest_check?.response_time ? `${db.latest_check.response_time.toFixed(0)} ms` : '-- ms'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onExportBackup && (
                        <button
                          onClick={() => onExportBackup(db)}
                          title="Get SQL Backup"
                          className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Get Backup</span>
                        </button>
                      )}
                      {onImportBackup && (
                        <button
                          onClick={() => onImportBackup(db)}
                          title="Import SQL Backup"
                          className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import</span>
                        </button>
                      )}
                    </div>

                    <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Diagnostics &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (activeTab === 'github') {
    const safeFilteredGithubProjects = filteredGithubProjects || []

    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Github className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            GitHub Repositories Monitoring Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track commits, pull requests, issues, GitHub Actions workflow runs & release tags across repositories.
          </p>
        </div>

        <button
          onClick={onAddGithub}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect GitHub Repo</span>
        </button>
      </div>

      {/* Search Bar Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Filter GitHub projects by owner, repo, branch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* GitHub Cards Grid */}
      {safeFilteredGithubProjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Github className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No GitHub repositories connected yet.</p>
          <button
            onClick={onAddGithub}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            + Connect GitHub Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeFilteredGithubProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedGithubProjectId(proj.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 truncate pr-2">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase font-mono">
                    {proj.github_owner}/{proj.github_repo}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {proj.name}
                  </h3>
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                  <Github className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Default Branch</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                    {proj.default_branch}
                  </span>
                </div>

                <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Auth Token</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {proj.has_token ? 'Encrypted PAT' : 'Public'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="text-[10px] font-mono text-slate-400">
                  ID: #{proj.id}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  View Repo Telemetry &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

  const safeFilteredAWSAccounts = filteredAWSAccounts || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-6 h-6 text-amber-500" />
            AWS Cloud Infrastructure Monitoring Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry for EC2 Compute, CloudWatch Metrics, EBS Storage Volumes, Security Group Rules & Elastic IPs.
          </p>
        </div>

        <button
          onClick={onAddAWS}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect AWS Account</span>
        </button>
      </div>

      {/* Search Bar Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Filter AWS accounts by label, region, access key..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all shadow-sm"
        />
      </div>

      {/* AWS Cards Grid */}
      {safeFilteredAWSAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Cloud className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No AWS Cloud Accounts connected yet.</p>
          <button
            onClick={onAddAWS}
            className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
          >
            + Connect AWS Account with Access & Secret Key
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeFilteredAWSAccounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSelectedAWSAccountId && setSelectedAWSAccountId(acc.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 truncate pr-2">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase font-mono">
                    Region: {acc.region}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    {acc.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate select-all">
                    Key: {acc.access_key_masked}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">EC2</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active</span>
                </div>
                <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">EBS</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Storage</span>
                </div>
                <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">EIP / SG</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Network</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="text-[10px] font-mono text-slate-400">
                  ID: #{acc.id}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  View AWS Infrastructure &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
