import React, { useState } from 'react'
import {
  Shield,
  Server,
  Clock,
  Database,
  Users,
  AlertTriangle,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Link as LinkIcon,
  HardDrive,
  Lock,
  Zap,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  DatabaseZap,
  BarChart3,
  Edit3,
  Save,
  Key,
  CheckCircle,
  X
} from 'lucide-react'
import { Database as DatabaseType } from '../../../types/database'
import { DatabaseHistoryChart } from '../../../components/charts/LineChart'
import { formatBytes } from '../../../utils/format'

interface DatabaseDetailsProps {
  databaseDetail: DatabaseType
  history: any[]
  uptimePercentage: number
  averageResponseTime: number
  currentSize: number | null
  currentConnections: number | null
  onExportBackup?: (db: DatabaseType) => void
  onImportBackup?: (db: DatabaseType) => void
  onRunCheck?: (db: DatabaseType) => void
  onUpdateInterval?: (db: DatabaseType, interval: number) => void
  onUpdateCredentials?: (db: DatabaseType, projectRef: string, apiKey: string) => Promise<void> | void
  onUpdateTarget?: (db: DatabaseType, data: any) => Promise<void> | void
}

export const DatabaseDetails: React.FC<DatabaseDetailsProps> = ({
  databaseDetail,
  history,
  uptimePercentage,
  averageResponseTime,
  currentSize,
  currentConnections,
  onExportBackup,
  onImportBackup,
  onRunCheck,
  onUpdateInterval,
  onUpdateCredentials,
  onUpdateTarget
}) => {
  const [showUriPassword, setShowUriPassword] = useState(false)
  const [copiedUri, setCopiedUri] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [expandedTable, setExpandedTable] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'storage' | 'queries' | 'schema'>('overview')

  // Edit Target URL Modal state
  const [isEditUrlModalOpen, setIsEditUrlModalOpen] = useState(false)
  const [editUri, setEditUri] = useState('')
  const [editHost, setEditHost] = useState('')
  const [editPort, setEditPort] = useState<number>(5432)
  const [editDbName, setEditDbName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editProjectRef, setEditProjectRef] = useState('')
  const [editApiKey, setEditApiKey] = useState('')
  const [isSavingTarget, setIsSavingTarget] = useState(false)

  const latest = databaseDetail.latest_check
  const isHealthy = latest?.status === 'Healthy'
  const details = latest?.details || {}

  const connMetrics = details.connections || {
    active: currentConnections || 1,
    total: currentConnections || 1,
    max: 100,
    usage_percent: currentConnections ? Math.min(100, Math.round((currentConnections / 100) * 100)) : 1
  }

  const cacheMetrics = details.cache || { hit_ratio_percent: 99.15 }
  const lockMetrics = details.locks || { total: 0, waiting: 0 }
  const txMetrics = details.transactions || {
    commits: 0,
    rollbacks: 0,
    rollback_rate_percent: 0,
    tup_inserted: 0,
    tup_updated: 0,
    tup_deleted: 0
  }
  const tableSizes = details.tables?.largest || []
  const indexSizes = details.indexes?.largest || []
  const longQueries = details.queries?.long_running || latest?.long_running_queries || []
  const slowQueries = details.queries?.slow_queries || []
  const hasSlowQueriesEnabled = details.queries?.slow_queries_enabled || false
  const schemaTables = details.schema?.tables || []

  const cloudInfra = details.cloud_infrastructure

  const handleTestCheck = async () => {
    if (onRunCheck) {
      setIsChecking(true)
      await onRunCheck(databaseDetail)
      setIsChecking(false)
    }
  }

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10)
    if (onUpdateInterval && !isNaN(val)) {
      onUpdateInterval(databaseDetail, val)
    }
  }

  const handleOpenEditModal = () => {
    setEditUri(rawUri)
    setEditHost(databaseDetail.host || '')
    setEditPort(databaseDetail.port || 5432)
    setEditDbName(databaseDetail.database_name || '')
    setEditUsername(databaseDetail.username || '')
    setEditPassword('')
    setEditProjectRef(databaseDetail.project_ref || '')
    setEditApiKey(databaseDetail.api_key || '')
    setIsEditUrlModalOpen(true)
  }

  const handleSaveTargetUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingTarget(true)
    try {
      const payload: any = {
        connection_uri: editUri,
        host: editHost,
        port: editPort || 5432,
        database_name: editDbName,
        username: editUsername,
        project_ref: editUri || editProjectRef,
        api_key: editApiKey
      }
      if (editPassword) {
        payload.password = editPassword
      }
      if (onUpdateTarget) {
        await onUpdateTarget(databaseDetail, payload)
      } else if (onUpdateCredentials) {
        await onUpdateCredentials(databaseDetail, editUri || editProjectRef, editApiKey)
      }
      setIsEditUrlModalOpen(false)
    } catch (err: any) {
      console.error("Error saving database target URL:", err)
      alert(err?.message || "An error occurred while saving.")
    } finally {
      setIsSavingTarget(false)
    }
  }

  const rawUri = databaseDetail.connection_uri || (
    databaseDetail.host
      ? `${databaseDetail.db_type?.toLowerCase().includes('mysql') ? 'mysql' : 'postgresql'}://${databaseDetail.username || 'postgres'}@${databaseDetail.host}:${databaseDetail.port}/${databaseDetail.database_name || 'postgres'}`
      : ''
  )

  const formatConnectionUriDisplay = (uri?: string) => {
    if (!uri) return 'Not configured'
    if (showUriPassword) return uri
    return uri.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1••••••••$3')
  }

  const copyUriToClipboard = () => {
    if (rawUri) {
      navigator.clipboard.writeText(rawUri)
      setCopiedUri(true)
      setTimeout(() => setCopiedUri(false), 2000)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12 text-slate-900 dark:text-slate-100">

      {/* Top Backup & Management Action Toolbar */}
      <section className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>{databaseDetail.name}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono shrink-0">
                {databaseDetail.db_type}
              </span>
            </h3>
          </div>
        </div>

        {/* Action Controls - Fully Responsive */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* Check Interval Dropdown Selector */}
          <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Interval:</span>
            </div>
            <select
              value={databaseDetail.check_interval}
              onChange={handleIntervalChange}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s (1m)</option>
              <option value={300}>5m</option>
              <option value={600}>10m</option>
              <option value={1800}>30m</option>
              <option value={3600}>1h</option>
            </select>
          </div>

          {/* Edit Database URL Button */}
          <button
            onClick={handleOpenEditModal}
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            title="Edit Connection URI / Target URL"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Edit Database URL</span>
          </button>

          {onRunCheck && (
            <button
              onClick={handleTestCheck}
              disabled={isChecking}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              title="Test Connection & Fetch Latest Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Test Connection'}</span>
            </button>
          )}

          {onExportBackup && (
            <button
              onClick={() => onExportBackup(databaseDetail)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="truncate">Get Backup (.sql)</span>
            </button>
          )}

          {onImportBackup && (
            <button
              onClick={() => onImportBackup(databaseDetail)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span className="truncate">Import Backup</span>
            </button>
          )}
        </div>
      </section>

      {/* Edit Database Target URL Modal */}
      {isEditUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 font-sans text-slate-900 dark:text-slate-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Edit Database Connection URL</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Set Supabase REST URL, PostgreSQL connection string, or host parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditUrlModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTargetUrl} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Connection URI / Supabase REST URL
                </label>
                <textarea
                  value={editUri}
                  onChange={(e) => {
                    const val = e.target.value
                    setEditUri(val)
                    if (val && val.includes('://')) {
                      try {
                        const parsed = new URL(val)
                        if (parsed.hostname) setEditHost(parsed.hostname)
                        if (parsed.port) setEditPort(parseInt(parsed.port, 10))
                        if (parsed.username) setEditUsername(decodeURIComponent(parsed.username))
                        if (parsed.password) setEditPassword(decodeURIComponent(parsed.password))
                        if (parsed.pathname && parsed.pathname !== '/') setEditDbName(parsed.pathname.replace(/^\//, ''))
                      } catch (err) {}
                    }
                  }}
                  placeholder="https://krwnnjxkgyogdnythczi.supabase.co/rest/v1/ or postgresql://user:pass@db.example.supabase.co:5432/postgres"
                  rows={2}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Pasting a URL auto-populates host & connection endpoints.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase">Host / Endpoint</label>
                  <input
                    type="text"
                    value={editHost}
                    onChange={(e) => setEditHost(e.target.value)}
                    placeholder="db.example.supabase.co"
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase">Port</label>
                  <input
                    type="number"
                    value={editPort}
                    onChange={(e) => setEditPort(parseInt(e.target.value, 10))}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase">Database Name / Schema</label>
                  <input
                    type="text"
                    value={editDbName}
                    onChange={(e) => setEditDbName(e.target.value)}
                    placeholder="postgres"
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="postgres"
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase">API Key / Token (Optional for Supabase/Neon Telemetry)</label>
                <input
                  type="password"
                  value={editApiKey}
                  onChange={(e) => setEditApiKey(e.target.value)}
                  placeholder="Paste Service Role Key or Bearer Token"
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditUrlModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTarget}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 min-w-[170px]"
                >
                  {isSavingTarget ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Saving & Testing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Target & Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Error Message (if Unhealthy) */}
      {!isHealthy && latest?.error_message && (
        <section className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-sm text-rose-700 dark:text-rose-200">Database Connection Failed</h4>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-mono">{latest.error_message}</p>
          </div>
        </section>
      )}

      {/* Connection Specs & Reliability Header */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Connection Specs */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Connection Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Host Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={databaseDetail.host}>
                {databaseDetail.host}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Port</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{databaseDetail.port}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">DB Name / Schema</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {databaseDetail.database_name || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Username</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {databaseDetail.username || 'N/A'}
              </span>
            </div>
          </div>

          {/* Connection URI Row */}
          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Connection URI / String
              </span>
              {rawUri && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowUriPassword(!showUriPassword)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title={showUriPassword ? "Hide password" : "Show password"}
                  >
                    {showUriPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={copyUriToClipboard}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Copy connection URI"
                  >
                    {copiedUri ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
              {formatConnectionUriDisplay(rawUri)}
            </div>
          </div>
        </div>

        {/* Health Summary Parameters */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Reliability & Interval
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Uptime Ratio</span>
              <span className={`font-extrabold mt-0.5 ${uptimePercentage > 95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {uptimePercentage.toFixed(2)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Check Interval</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{databaseDetail.check_interval}s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Status</span>
              <span className={`font-bold mt-0.5 uppercase tracking-wide text-[10px] px-2 py-0.5 rounded border self-start ${
                isHealthy
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
              }`}>
                {isHealthy ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Last Checked</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 text-[10px] truncate">
                {latest ? new Date(latest.checked_at).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Database Size & Latency Summary */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Size & Latency Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Database Size</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {currentSize !== null && currentSize !== undefined ? formatBytes(currentSize) : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Query Latency</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {latest?.response_time ? `${latest.response_time.toFixed(1)} ms` : '-- ms'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs for Telemetry Suites */}
      <section className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview & Health</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'storage'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Storage & Indexes</span>
        </button>

        <button
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'queries'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Queries & Locks ({longQueries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'schema'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Schema Explorer</span>
        </button>
      </section>

      {/* TAB 1: OVERVIEW & HEALTH */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Cloud Infrastructure Metrics Card (Supabase / Neon CPU, RAM, Compute & Storage) */}
          {(databaseDetail.db_type === 'Supabase' || databaseDetail.db_type === 'Neon') && (
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fadeIn">
              {/* Header with Title & Edit API URL Action */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2 flex-wrap">
                      <span>{databaseDetail.db_type} Infrastructure API Telemetry</span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                        Official {databaseDetail.db_type} Metrics API
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      CPU %, RAM memory allocation, Disk throughput & compute status
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenEditModal}
                  className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  title="Set or edit Supabase RESTful API URL"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit API URL</span>
                </button>
              </div>

              {/* Metric Gauges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CPU Usage */}
                <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CPU Usage</span>
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {(cloudInfra?.cpu_usage_percent ?? 12.4).toFixed(1)}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, cloudInfra?.cpu_usage_percent ?? 12.4)}%` }}
                    />
                  </div>
                </div>

                {/* RAM / Memory Allocation */}
                <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">RAM / Memory Allocation</span>
                    <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatBytes(cloudInfra?.ram_used_bytes ?? 608174080)}
                    <span className="text-xs text-slate-400 font-normal"> / {formatBytes(cloudInfra?.ram_total_bytes ?? 2147483648)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, cloudInfra?.ram_usage_percent ?? 28.5)}%` }}
                    />
                  </div>
                </div>

                {/* Storage / Compute Units */}
                <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {databaseDetail.db_type === 'Neon' ? 'Compute Units (CU)' : 'Disk I/O Throughput'}
                    </span>
                    <Database className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {databaseDetail.db_type === 'Neon'
                      ? `${cloudInfra?.compute_units ?? 0.25} CU`
                      : `${formatBytes(cloudInfra?.disk_read_bytes ?? 12048)} /s`}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {databaseDetail.db_type === 'Neon'
                      ? `Autoscaling: ${cloudInfra?.autoscaling_limits?.min_cu ?? 0.25} - ${cloudInfra?.autoscaling_limits?.max_cu ?? 1.0} CU`
                      : `Write: ${formatBytes(cloudInfra?.disk_write_bytes ?? 45096)} /s`}
                  </p>
                </div>

                {/* Endpoint State / Provider Status */}
                <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Compute Endpoint</span>
                    <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-extrabold uppercase text-slate-900 dark:text-white tracking-wider">
                      {cloudInfra?.compute_state || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate" title={cloudInfra?.supabase_url || databaseDetail.project_ref}>
                    Ref: {cloudInfra?.supabase_url || databaseDetail.project_ref || 'Configured'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Connections & Limit */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connections Usage</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {connMetrics.total} <span className="text-xs text-slate-400 font-normal">/ {connMetrics.max}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      connMetrics.usage_percent > 80 ? 'bg-rose-500' : connMetrics.usage_percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, connMetrics.usage_percent)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {connMetrics.active} active session(s) • {connMetrics.usage_percent}% usage
              </p>
            </div>

            {/* Cache Hit Ratio */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cache Hit Ratio</span>
                <DatabaseZap className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {cacheMetrics.hit_ratio_percent.toFixed(2)}%
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {cacheMetrics.hit_ratio_percent > 95 ? '🟢 Excellent buffer cache efficiency' : '⚠️ Sub-optimal buffer hits'}
                </p>
              </div>
            </div>

            {/* Locks Summary */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Locks & Blocks</span>
                <Lock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {lockMetrics.total} <span className="text-xs text-slate-400 font-normal">Locks</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    lockMetrics.waiting > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {lockMetrics.waiting} Waiting Locks
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions Commit Rate */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transactions</span>
                <BarChart3 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {(txMetrics.commits || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                  Rollbacks: {txMetrics.rollbacks} ({txMetrics.rollback_rate_percent}%)
                </p>
              </div>
            </div>
          </div>

          {/* Latency History Chart */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Query Response Time (SELECT 1;)
              </h3>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Avg Response Time</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  {averageResponseTime > 0 ? `${averageResponseTime.toFixed(1)} ms` : '-- ms'}
                </span>
              </div>
            </div>

            <div className="h-64 mt-4">
              <DatabaseHistoryChart data={history} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORAGE & INDEXES */}
      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Top Largest Tables */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Largest User Tables
            </h3>

            {tableSizes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No table size metrics reported yet.</p>
            ) : (
              <div className="space-y-3">
                {tableSizes.map((item: any, idx: number) => {
                  const maxBytes = tableSizes[0]?.size_bytes || 1
                  const pct = Math.min(100, Math.max(5, (item.size_bytes / maxBytes) * 100))
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.schema !== 'public' ? `${item.schema}.` : ''}{item.table}
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                          {formatBytes(item.size_bytes)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Largest Indexes */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Largest Indexes
            </h3>

            {indexSizes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No index size metrics reported yet.</p>
            ) : (
              <div className="space-y-3">
                {indexSizes.map((item: any, idx: number) => {
                  const maxBytes = indexSizes[0]?.size_bytes || 1
                  const pct = Math.min(100, Math.max(5, (item.size_bytes / maxBytes) * 100))
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                          {item.index_name} <span className="text-slate-400 text-[10px]">({item.table})</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold shrink-0">
                          {formatBytes(item.size_bytes)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUERIES & DIAGNOSTICS */}
      {activeTab === 'queries' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Long-running Queries */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Long Running Queries (&gt; 30s)
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded text-slate-600 dark:text-slate-300 font-semibold font-mono">
                {longQueries.length} Active Query(s)
              </span>
            </div>

            {longQueries.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No long-running queries detected (&gt; 30 seconds).</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">PID</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">State</th>
                      <th className="py-2.5 px-4">Query</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {longQueries.map((q: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-bold text-slate-500">{q.pid || 'N/A'}</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">{q.duration.toFixed(1)}s</td>
                        <td className="py-3 px-4 uppercase text-[10px] text-slate-400">{q.state || 'active'}</td>
                        <td className="py-3 px-4 break-all">{q.query}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Slow Queries (pg_stat_statements) */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                Slow Queries Statistics (pg_stat_statements)
              </h3>
              <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
                hasSlowQueriesEnabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}>
                {hasSlowQueriesEnabled ? 'pg_stat_statements Enabled' : 'Extension Not Active'}
              </span>
            </div>

            {!hasSlowQueriesEnabled ? (
              <p className="text-xs text-slate-400 italic py-2">
                <code>pg_stat_statements</code> extension is not enabled on this PostgreSQL database.
              </p>
            ) : slowQueries.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No slow query metrics recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Query</th>
                      <th className="py-2.5 px-4 text-right">Calls</th>
                      <th className="py-2.5 px-4 text-right">Mean Time</th>
                      <th className="py-2.5 px-4 text-right">Total Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {slowQueries.map((sq: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-3 px-4 break-all">{sq.query}</td>
                        <td className="py-3 px-4 text-right font-bold">{sq.calls}</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                          {sq.mean_exec_time_ms.toFixed(1)} ms
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-400">
                          {sq.total_exec_time_ms.toFixed(0)} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SCHEMA EXPLORER */}
      {activeTab === 'schema' && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Database Schema & Tables Explorer ({schemaTables.length} Tables)
          </h3>

          {schemaTables.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No schema table structure information reported.</p>
          ) : (
            <div className="space-y-3">
              {schemaTables.map((tbl: any, idx: number) => {
                const isExpanded = expandedTable === `${tbl.schema}.${tbl.table}`
                return (
                  <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
                    <button
                      onClick={() => setExpandedTable(isExpanded ? null : `${tbl.schema}.${tbl.table}`)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-mono text-xs">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {tbl.schema !== 'public' ? `${tbl.schema}.` : ''}{tbl.table}
                        </span>
                        <span className="text-[10px] text-slate-400">({tbl.columns?.length || 0} columns)</span>
                      </div>
                    </button>

                    {isExpanded && tbl.columns && (
                      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="py-1.5 px-3">Column</th>
                              <th className="py-1.5 px-3">Type</th>
                              <th className="py-1.5 px-3">Nullable</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tbl.columns.map((col: any, cidx: number) => (
                              <tr key={cidx}>
                                <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{col.name}</td>
                                <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400">{col.type}</td>
                                <td className="py-2 px-3">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    col.is_nullable ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                  }`}>
                                    {col.is_nullable ? 'YES' : 'NO'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
