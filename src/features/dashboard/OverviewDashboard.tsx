import React, { useState, useEffect } from 'react'
import {
  Activity,
  Server as ServerIcon,
  Globe,
  Database as DatabaseIcon,
  Cloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Cpu,
  HardDrive,
  Layers,
  FileText,
  X
} from 'lucide-react'
import { Github } from '../../components/icons/Github'
import { Server } from '../../types/server'
import { Website } from '../../types/website'
import { Database } from '../../types/database'
import { GitHubProject } from '../../types/github'
import { AWSAccount } from '../../types/aws'
import { API_BASE } from '../../config'

interface OverviewDashboardProps {
  servers: Server[]
  websites: Website[]
  databases: Database[]
  githubProjects: GitHubProject[]
  awsAccounts?: AWSAccount[]
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
  onSelectTab: (tab: any) => void
  onSelectServer: (id: number) => void
  onSelectWebsite: (id: number) => void
  onSelectDatabase: (id: number) => void
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  servers = [],
  websites = [],
  databases = [],
  githubProjects = [],
  awsAccounts = [],
  authFetch,
  onSelectTab,
  onSelectServer,
  onSelectWebsite,
  onSelectDatabase
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'servers' | 'websites' | 'databases' | 'github' | 'aws'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'healthy' | 'down'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Daily Report Modal & Action States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [reportConfig, setReportConfig] = useState<{ daily_report_enabled: boolean; daily_report_time: string; last_daily_report_sent: string | null }>({
    daily_report_enabled: true,
    daily_report_time: '21:00',
    last_daily_report_sent: null
  })

  // Fetch Daily Report Config on mount
  useEffect(() => {
    fetchReportConfig()
  }, [])

  const fetchReportConfig = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/telegram/daily-report/config/`)
      if (res.ok) {
        const data = await res.json()
        setReportConfig(data)
      }
    } catch (err) {
      console.error('Error fetching daily report config:', err)
    }
  }

  const handleSendDailyReportNow = async () => {
    setSendingReport(true)
    try {
      const res = await authFetch(`${API_BASE}/api/telegram/daily-report/send/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(`✅ ${data.message}`)
        fetchReportConfig()
      } else {
        alert(`❌ ${data.error || 'Failed to dispatch report.'}`)
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`)
    } finally {
      setSendingReport(false)
    }
  }

  const handleOpenPreview = async () => {
    setIsPreviewOpen(true)
    setLoadingPreview(true)
    try {
      const res = await authFetch(`${API_BASE}/api/telegram/daily-report/preview/`)
      if (res.ok) {
        const data = await res.json()
        setPreviewText(data.formatted_text || '')
      } else {
        setPreviewText('Failed to load daily report preview.')
      }
    } catch (err) {
      setPreviewText('Error loading preview.')
    } finally {
      setLoadingPreview(false)
    }
  }

  // Calculate Aggregated Metrics
  const onlineServers = servers.filter((s) => s.is_online)
  const healthyServers = servers.filter((s) => {
    const reading = s.latest_reading
    if (!s.is_online) return false
    if (!reading) return true
    return reading.cpu < 85 && reading.ram < 85 && reading.disk < 90
  })

  const onlineWebsites = websites.filter((w) => w.latest_check?.status === 'Online')
  const healthyDatabases = databases.filter((d) => d.latest_check?.status === 'Healthy')

  const totalServices = servers.length + websites.length + databases.length + githubProjects.length + (awsAccounts?.length || 0)
  const totalHealthy = healthyServers.length + onlineWebsites.length + healthyDatabases.length + githubProjects.length + (awsAccounts?.length || 0)
  const totalDown = totalServices - totalHealthy
  const healthScore = totalServices > 0 ? Math.round((totalHealthy / totalServices) * 100) : 100

  // Filter Logic
  const filteredServersList = servers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.project_name.toLowerCase().includes(searchQuery.toLowerCase())
    const isHealthy = healthyServers.some(hs => hs.id === s.id)
    if (filterStatus === 'healthy' && !isHealthy) return false
    if (filterStatus === 'down' && isHealthy) return false
    return matchSearch
  })

  const filteredWebsitesList = websites.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.url.toLowerCase().includes(searchQuery.toLowerCase())
    const isHealthy = w.latest_check?.status === 'Online'
    if (filterStatus === 'healthy' && !isHealthy) return false
    if (filterStatus === 'down' && isHealthy) return false
    return matchSearch
  })

  const filteredDatabasesList = databases.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.db_type.toLowerCase().includes(searchQuery.toLowerCase()) || d.host.toLowerCase().includes(searchQuery.toLowerCase())
    const isHealthy = d.latest_check?.status === 'Healthy'
    if (filterStatus === 'healthy' && !isHealthy) return false
    if (filterStatus === 'down' && isHealthy) return false
    return matchSearch
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Unified Service Analytics & Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Services Control Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time telemetry, node diagnostics, database connectivity, and automated <b>Daily 9:00 PM Telegram Health Reports</b> for your entire infrastructure stack.
            </p>
          </div>

          {/* Daily 9:00 PM Report Quick Card */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shrink-0 space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Daily Health Report</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Scheduled 9:00 PM
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: <strong className="text-white">{reportConfig.daily_report_enabled ? 'Active' : 'Disabled'}</strong></span>
              <span>Time: <strong className="text-indigo-300">{reportConfig.daily_report_time || '21:00'}</strong></span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSendDailyReportNow}
                disabled={sendingReport}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {sendingReport ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send 9 PM Report Now</span>
              </button>

              <button
                onClick={handleOpenPreview}
                className="p-2 bg-slate-700/80 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center shadow-sm transition-all"
                title="Preview Daily Report Text"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Services Monitored</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalServices}</span>
            <span className="text-xs text-slate-400 font-medium">Nodes & Endpoints</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Server: {servers.length}</span>
            <span>Web: {websites.length}</span>
            <span>DB: {databases.length}</span>
          </div>
        </div>

        {/* System Health Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>System Health Score</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              healthScore >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${
              healthScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {healthScore}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Operational Stability</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Healthy Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Healthy & Online</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalHealthy}</span>
            <span className="text-xs text-slate-400 font-medium">Fully Functional</span>
          </div>
          <p className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
            {totalHealthy} of {totalServices} services running optimally
          </p>
        </div>

        {/* Degraded / Down */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Action Required / Offline</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              totalDown === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${totalDown > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              {totalDown}
            </span>
            <span className="text-xs text-slate-400 font-medium">Warnings / Outages</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
            {totalDown === 0 ? 'All systems operating normally' : `${totalDown} service(s) need attention`}
          </p>
        </div>
      </div>

      {/* Control & Filtering Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filterCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Services ({totalServices})
          </button>

          <button
            onClick={() => setFilterCategory('servers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              filterCategory === 'servers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ServerIcon className="w-3.5 h-3.5" />
            <span>Servers ({servers.length})</span>
          </button>

          <button
            onClick={() => setFilterCategory('websites')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              filterCategory === 'websites'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Websites ({websites.length})</span>
          </button>

          <button
            onClick={() => setFilterCategory('databases')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              filterCategory === 'databases'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DatabaseIcon className="w-3.5 h-3.5" />
            <span>Databases ({databases.length})</span>
          </button>

          <button
            onClick={() => setFilterCategory('github')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              filterCategory === 'github'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub ({githubProjects.length})</span>
          </button>

          <button
            onClick={() => setFilterCategory('aws')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              filterCategory === 'aws'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>AWS ({awsAccounts.length})</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          {/* Status Filter pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterStatus === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('healthy')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterStatus === 'healthy' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Healthy
            </button>
            <button
              onClick={() => setFilterStatus('down')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterStatus === 'down' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Offline
            </button>
          </div>

          {/* Search Box */}
          <div className="relative shrink-0 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Services Grid Sections */}
      <div className="space-y-8">
        {/* SERVERS SECTION */}
        {(filterCategory === 'all' || filterCategory === 'servers') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ServerIcon className="w-4 h-4 text-indigo-500" />
                <span>Servers Infrastructure ({filteredServersList.length})</span>
              </h2>
              <button
                onClick={() => onSelectTab('servers')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All Servers</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {filteredServersList.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No matching server nodes found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServersList.map((server) => {
                  const reading = server.latest_reading
                  const isOnline = server.is_online
                  const cpu = reading ? reading.cpu : 0
                  const ram = reading ? reading.ram : 0
                  const disk = reading ? reading.disk : 0

                  return (
                    <div
                      key={server.id}
                      onClick={() => onSelectServer(server.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                              {server.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {server.environment || 'Production'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{server.project_name} • {server.hostname}</p>
                        </div>

                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                          isOnline ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                      </div>

                      {/* Telemetry Resource Bars */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-indigo-500" /> CPU Load</span>
                            <span className="font-mono">{cpu.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cpu > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(cpu, 100)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-purple-500" /> RAM Memory</span>
                            <span className="font-mono">{ram.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${ram > 85 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(ram, 100)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-cyan-500" /> Disk Volume</span>
                            <span className="font-mono">{disk.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${disk > 90 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(disk, 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>IP: <code className="text-slate-600 dark:text-slate-300 font-mono">{server.public_ip || 'Internal'}</code></span>
                        <span>Seen: {server.last_seen ? new Date(server.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* WEBSITES SECTION */}
        {(filterCategory === 'all' || filterCategory === 'websites') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Website & HTTP Monitors ({filteredWebsitesList.length})</span>
              </h2>
              <button
                onClick={() => onSelectTab('websites')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All Websites</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {filteredWebsitesList.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No matching website monitors found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWebsitesList.map((web) => {
                  const check = web.latest_check
                  const isOnline = check?.status === 'Online'
                  const httpCode = check?.http_status || 200
                  const latency = check?.response_time || 0

                  return (
                    <div
                      key={web.id}
                      onClick={() => onSelectWebsite(web.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                            {web.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{web.url}</p>
                        </div>

                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shrink-0 ${
                          isOnline ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span>{isOnline ? '200 OK' : 'DOWN'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Response Latency</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{latency ? `${latency.toFixed(1)} ms` : 'N/A'}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Project: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{web.project}</strong></span>
                        <span>HTTP Code: <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{httpCode}</code></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* DATABASES SECTION */}
        {(filterCategory === 'all' || filterCategory === 'databases') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DatabaseIcon className="w-4 h-4 text-purple-500" />
                <span>Databases Infrastructure ({filteredDatabasesList.length})</span>
              </h2>
              <button
                onClick={() => onSelectTab('databases')}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All Databases</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {filteredDatabasesList.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No matching database instances found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDatabasesList.map((db) => {
                  const check = db.latest_check
                  const isHealthy = check?.status === 'Healthy'
                  const respTime = check?.response_time || 0

                  return (
                    <div
                      key={db.id}
                      onClick={() => onSelectDatabase(db.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                            {db.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{db.project} • {db.db_type}</p>
                        </div>

                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                          isHealthy ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-purple-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span>{isHealthy ? 'HEALTHY' : 'UNHEALTHY'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Host:</span>
                          <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">{db.host}:{db.port}</code>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Query Time:</span>
                          <span className="font-mono text-purple-500 font-bold">{respTime ? `${respTime.toFixed(1)} ms` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DAILY REPORT PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Daily 9:00 PM Telegram Report Preview</h3>
                  <p className="text-[11px] text-slate-400">Formatted text automatically dispatched to subscribers daily at 9:00 PM</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPreview ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                <p className="text-xs">Generating live system report data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px] overflow-y-auto whitespace-pre-wrap">
                  {previewText}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Will trigger automatically at <b>{reportConfig.daily_report_time || '21:00'}</b> today.
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Close Preview
                    </button>
                    <button
                      onClick={() => {
                        setIsPreviewOpen(false)
                        handleSendDailyReportNow()
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Telegram Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
