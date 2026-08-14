import React from 'react'
import { Database, Cpu, HardDrive, Network, Terminal, Check, Copy } from 'lucide-react'
import { DetailedServer, MetricHistoryPoint } from '../../../types/server'
import { formatBytes, formatSpeed, formatUptime } from '../../../lib/format'
import { ServerHistoryChart } from '../../../components/common/LineChart'
import { API_BASE } from '../../../config'

interface ServerDetailsProps {
  serverDetail: DetailedServer | null
  history: MetricHistoryPoint[]
  copiedToken: boolean
  setCopiedToken: (val: boolean) => void
  copyToClipboard: (text: string, setter: (val: boolean) => void) => void
}

export const ServerDetails: React.FC<ServerDetailsProps> = ({
  serverDetail,
  history,
  copiedToken,
  setCopiedToken,
  copyToClipboard
}) => {
  if (!serverDetail) return null

  // Diagnostics workspace tab & console states
  const [activeDiagTab, setActiveDiagTab] = React.useState<'processes' | 'logs'>('processes')
  const [logType, setLogType] = React.useState<'django' | 'gunicorn' | 'nginx' | 'celery' | 'system'>('django')
  const [logLevel, setLogLevel] = React.useState<string>('')
  const [logSearch, setLogSearch] = React.useState<string>('')
  const [logs, setLogs] = React.useState<any[]>([])
  const [logsAutoRefresh, setLogsAutoRefresh] = React.useState<boolean>(true)

  const fetchLogs = React.useCallback(async () => {
    try {
      const url = `${API_BASE}/api/logs/?server_id=${serverDetail.id}&log_type=${logType}&level=${logLevel}&search=${encodeURIComponent(logSearch)}&limit=100`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    }
  }, [serverDetail.id, logType, logLevel, logSearch])

  React.useEffect(() => {
    if (activeDiagTab !== 'logs') return
    fetchLogs()
    if (!logsAutoRefresh) return

    const timer = setInterval(() => {
      fetchLogs()
    }, 3000)
    return () => clearInterval(timer)
  }, [activeDiagTab, fetchLogs, logsAutoRefresh])

  const downloadUrl = `${API_BASE}/api/logs/download/?server_id=${serverDetail.id}&log_type=${logType}&level=${logLevel}&search=${encodeURIComponent(logSearch)}`

  // Helper values
  const hasReading = !!serverDetail.latest_reading
  const cpuVal = hasReading ? serverDetail.latest_reading!.cpu : 0
  const ramVal = hasReading ? serverDetail.latest_reading!.ram : 0
  const diskVal = hasReading ? serverDetail.latest_reading!.disk : 0
  const uptimeVal = hasReading ? serverDetail.latest_reading!.uptime : 0
  const processCount = hasReading ? serverDetail.latest_reading!.process_count : 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100 pb-12">
      {/* Row 1: Hardware Summary Specification Sheet */}
      <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>System Specifications & Node Metadata</span>
          </h3>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono break-all">
              Token: <span className="text-slate-800 dark:text-slate-200 select-all font-semibold">{serverDetail.token.substring(0, 8)}...</span>
            </span>
            <button
              onClick={() => copyToClipboard(serverDetail.token, setCopiedToken)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1 text-xs shrink-0"
              title="Copy Token"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Operating System</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate" title={serverDetail.os}>
              {serverDetail.os || 'Ubuntu'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 truncate" title={serverDetail.hostname}>
              {serverDetail.hostname}
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">CPU Model</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate" title={serverDetail.cpu_model}>
              {serverDetail.cpu_model || 'Waiting for agent...'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              Processor Core Specs
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">System Memory</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
              {serverDetail.total_ram > 0 ? formatBytes(serverDetail.total_ram) : 'Waiting for report...'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              Total RAM capacity
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Hard Disk Storage</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
              {serverDetail.total_disk > 0 ? formatBytes(serverDetail.total_disk) : 'Waiting for report...'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              Total Disk capacity
            </span>
          </div>
        </div>
      </section>

      {/* Row 2: Live Gauges & Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Panel */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">CPU Utilization</span>
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="my-6 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">{cpuVal.toFixed(0)}</span>
            <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">%</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${cpuVal}%` }}
            />
          </div>
        </section>

        {/* RAM Panel */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">RAM Usage</span>
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="my-6 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">{ramVal.toFixed(0)}</span>
            <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">%</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${ramVal}%` }}
            />
          </div>
        </section>

        {/* Disk Panel */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Disk Storage</span>
            <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="my-6 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">{diskVal.toFixed(0)}</span>
            <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">%</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${diskVal}%` }}
            />
          </div>
        </section>
      </div>

      {/* Row 3: Metrics History Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Graph */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Performance Timeline
            </h4>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> CPU %</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> RAM %</span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-4">
            <ServerHistoryChart data={history} />
          </div>
        </section>

        {/* Load Averages / Uptime Grid */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              Diagnostic Parameters
            </h4>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-1 sm:gap-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Uptime</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {hasReading ? formatUptime(uptimeVal) : 'Waiting...'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-1 sm:gap-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Load Avg (1m/5m/15m)</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 break-all">
                  {hasReading && serverDetail.latest_reading?.load_average_1m !== undefined
                    ? `${serverDetail.latest_reading.load_average_1m.toFixed(2)} / ${serverDetail.latest_reading.load_average_5m.toFixed(2)} / ${serverDetail.latest_reading.load_average_15m.toFixed(2)}`
                    : 'Waiting...'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-1 sm:gap-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Swap Memory Space</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {hasReading && serverDetail.latest_reading?.swap_percent !== undefined
                    ? `${serverDetail.latest_reading.swap_percent.toFixed(1)}%`
                    : 'Waiting...'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-1 gap-1 sm:gap-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Network Speed (Up/Down)</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono break-all">
                  <Network className="w-3.5 h-3.5 shrink-0" />
                  {hasReading
                    ? `${formatSpeed(serverDetail.latest_reading!.network_upload)} / ${formatSpeed(serverDetail.latest_reading!.network_download)}`
                    : 'Waiting...'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Active Processes</span>
            <span className="text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 px-2.5 py-1 rounded text-indigo-700 dark:text-indigo-400 font-mono">
              {hasReading ? `${processCount} Running` : 'Waiting...'}
            </span>
          </div>
        </section>
      </div>

      {/* Row 4: System Services Health Monitor */}
      <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          System Services Health Monitor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Nginx */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Nginx Server</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reverse Proxy</span>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${
              serverDetail.latest_reading?.services?.nginx
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${serverDetail.latest_reading?.services?.nginx ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {serverDetail.latest_reading?.services?.nginx ? 'RUNNING' : 'DOWN'}
            </span>
          </div>

          {/* Gunicorn */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Gunicorn Gateway</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">WSGI Application</span>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${
              serverDetail.latest_reading?.services?.gunicorn
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${serverDetail.latest_reading?.services?.gunicorn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {serverDetail.latest_reading?.services?.gunicorn ? 'RUNNING' : 'DOWN'}
            </span>
          </div>

          {/* Redis */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Redis Store</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">In-Memory Cache</span>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${
              serverDetail.latest_reading?.services?.redis
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${serverDetail.latest_reading?.services?.redis ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {serverDetail.latest_reading?.services?.redis ? 'RUNNING' : 'DOWN'}
            </span>
          </div>

          {/* Celery */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Celery Worker</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Task Queue</span>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${
              serverDetail.latest_reading?.services?.celery
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${serverDetail.latest_reading?.services?.celery ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {serverDetail.latest_reading?.services?.celery ? 'RUNNING' : 'DOWN'}
            </span>
          </div>
        </div>
      </section>

      {/* Row 5: Diagnostic explorer tabs */}
      <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveDiagTab('processes')}
              className={`text-xs font-bold tracking-wider uppercase transition-all border-b-2 pb-2 -mb-3.5 flex items-center gap-2 ${
                activeDiagTab === 'processes'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Processes Explorer
            </button>
            <button
              onClick={() => setActiveDiagTab('logs')}
              className={`text-xs font-bold tracking-wider uppercase transition-all border-b-2 pb-2 -mb-3.5 flex items-center gap-2 ${
                activeDiagTab === 'logs'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Live Logs Console
            </button>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded font-semibold">
            {activeDiagTab === 'processes' ? 'Updated 15s' : 'Updated 3s'}
          </span>
        </div>

        {activeDiagTab === 'processes' ? (
          <div className="overflow-x-auto animate-fadeIn">
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">PID</th>
                  <th className="py-3 px-4">Process Name</th>
                  <th className="py-3 px-4 text-right">CPU %</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Memory %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hasReading && serverDetail.latest_reading?.top_processes && serverDetail.latest_reading.top_processes.length > 0 ? (
                  serverDetail.latest_reading.top_processes.map((proc, idx) => (
                    <tr key={`${proc.pid}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{proc.pid}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{proc.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{proc.cpu_percent.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{proc.memory_percent.toFixed(1)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                      No diagnostics reports available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 animate-fadeIn">
            {/* Console Top Control Bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Source</label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
                  >
                    <option value="django">Django (Agent)</option>
                    <option value="gunicorn">Gunicorn</option>
                    <option value="nginx">Nginx</option>
                    <option value="celery">Celery</option>
                    <option value="system">System (Syslog)</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Level</label>
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
                  >
                    <option value="">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Search Message</label>
                  <input
                    type="text"
                    placeholder="Search message text..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 self-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={logsAutoRefresh}
                    onChange={(e) => setLogsAutoRefresh(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  Live Stream
                </label>

                <a
                  href={downloadUrl}
                  download
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </div>

            {/* Terminal Log Console */}
            <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-200 shadow-inner max-h-96 overflow-y-auto flex flex-col space-y-1">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 italic">
                  No log outputs recorded yet. Streaming live events...
                </div>
              ) : (
                logs.map((log) => {
                  let lvlClass = 'text-slate-400'
                  if (log.level === 'ERROR') lvlClass = 'text-rose-400 font-bold'
                  else if (log.level === 'WARNING') lvlClass = 'text-amber-400'
                  else if (log.level === 'INFO') lvlClass = 'text-emerald-400'

                  const dateStr = new Date(log.timestamp).toLocaleTimeString()
                  return (
                    <div key={log.id} className="hover:bg-slate-800/50 py-0.5 px-2 rounded flex items-start gap-3 transition-colors border-l border-transparent hover:border-indigo-500">
                      <span className="text-slate-500 select-none font-semibold w-16">{dateStr}</span>
                      <span className={`w-14 shrink-0 uppercase tracking-wide select-none ${lvlClass}`}>[{log.level}]</span>
                      <span className="text-slate-200 select-text break-all">{log.message}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
