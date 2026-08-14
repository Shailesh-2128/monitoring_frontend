import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { API_BASE } from '../../../config'
import {
  FileText, RefreshCw, Search, ShieldCheck, User, Calendar,
  Clock, Filter, Server, Globe, Database, GitBranch, Cloud, DollarSign, Activity
} from 'lucide-react'

export interface AuditLogItem {
  id: number
  user: number | null
  username: string
  action: string
  module: string
  description: string
  ip_address: string | null
  timestamp: string
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  servers: <Server className="w-3.5 h-3.5 text-blue-500" />,
  websites: <Globe className="w-3.5 h-3.5 text-emerald-500" />,
  databases: <Database className="w-3.5 h-3.5 text-cyan-500" />,
  github: <GitBranch className="w-3.5 h-3.5 text-purple-500" />,
  aws: <Cloud className="w-3.5 h-3.5 text-amber-500" />,
  aws_costing: <DollarSign className="w-3.5 h-3.5 text-green-500" />,
  iam: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />,
}

export const AuditLogsTab: React.FC = () => {
  const { token } = useAuth()
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const fetchLogs = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const queryParts: string[] = []
      if (search) queryParts.push(`search=${encodeURIComponent(search)}`)
      if (moduleFilter) queryParts.push(`module=${moduleFilter}`)
      if (actionFilter) queryParts.push(`action=${actionFilter}`)

      const queryStr = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
      const res = await fetch(`${API_BASE}/api/iam/audit-logs/${queryStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        throw new Error('Failed to load audit logs.')
      }
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : data.results || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error loading audit logs')
    } finally {
      setLoading(false)
    }
  }, [token, search, moduleFilter, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getActionBadge = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('CREATE')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-mono">
          {action}
        </span>
      )
    }
    if (action.includes('DELETE') || action.includes('FAILED') || action.includes('DISABLED')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20 font-mono">
          {action}
        </span>
      )
    }
    if (action.includes('UPDATE')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 font-mono">
          {action}
        </span>
      )
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
        {action}
      </span>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Superadmin System Audit Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive real-time activity tracking, security events, authentication attempts, and infrastructure changes.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, description, IP..."
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Service Modules</option>
            <option value="iam">User & IAM</option>
            <option value="servers">Server Monitoring</option>
            <option value="websites">Website Monitoring</option>
            <option value="databases">Database Monitoring</option>
            <option value="github">GitHub Monitoring</option>
            <option value="aws">AWS Cloud Monitoring</option>
            <option value="aws_costing">AWS Costing</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Event Types</option>
            <option value="LOGIN_SUCCESS">LOGIN SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN FAILED</option>
            <option value="USER_CREATE">USER CREATE</option>
            <option value="USER_UPDATE">USER UPDATE</option>
            <option value="USER_DELETE">USER DELETE</option>
            <option value="TEAM_CREATE">TEAM CREATE</option>
            <option value="TEAM_DELETE">TEAM DELETE</option>
            <option value="SERVER_CREATE">SERVER CREATE</option>
            <option value="WEBSITE_CREATE">WEBSITE CREATE</option>
            <option value="DATABASE_CREATE">DATABASE CREATE</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching audit log events...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No audit log records match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                          {(log.username[0] || 'U').toUpperCase()}
                        </div>
                        <span>{log.username}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-xs capitalize">
                        {MODULE_ICONS[log.module] || <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{log.module.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
