import React from 'react'
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts'
import { MetricHistoryPoint } from '../../types/server'
import { WebsiteHistoryPoint } from '../../types/website'
import { formatTimeLabel } from '../../lib/format'

interface ServerChartProps {
  data: MetricHistoryPoint[]
}

export const ServerHistoryChart: React.FC<ServerChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
        Waiting for telemetry logs...
      </div>
    )
  }

  const chartData = data.map((d) => ({
    time: formatTimeLabel(d.timestamp),
    cpu: d.cpu_percent,
    ram: d.ram_percent,
    disk: d.disk_percent
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="%" />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload
              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl shadow-lg text-xs font-mono">
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">{item.time}</p>
                  <p className="text-indigo-600 dark:text-indigo-400">CPU: {item.cpu.toFixed(1)}%</p>
                  <p className="text-emerald-600 dark:text-emerald-400">RAM: {item.ram.toFixed(1)}%</p>
                  <p className="text-slate-600 dark:text-slate-300">Disk: {item.disk.toFixed(1)}%</p>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="cpu"
          stroke="#6366f1"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCpu)"
          name="CPU"
        />
        <Area
          type="monotone"
          dataKey="ram"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRam)"
          name="RAM"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface WebsiteChartProps {
  data: WebsiteHistoryPoint[]
}

export const WebsiteHistoryChart: React.FC<WebsiteChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
        Waiting for website checker loop telemetry data...
      </div>
    )
  }

  const chartData = data.map((d) => ({
    time: formatTimeLabel(d.timestamp),
    rt: d.response_time,
    status: d.status,
    http: d.http_status
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={chartData}>
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="ms" />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload
              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl shadow-lg text-xs font-mono">
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">{item.time}</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Response: {item.rt !== null ? `${item.rt.toFixed(0)} ms` : 'N/A'}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    Status:{' '}
                    <span className={item.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {item.status}
                    </span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">HTTP Status: {item.http || 'N/A'}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="rt"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: '#818cf8', strokeWidth: 1 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

interface DatabaseChartProps {
  data: Array<{
    timestamp: string
    response_time: number | null
    status: string
  }>
}

export const DatabaseHistoryChart: React.FC<DatabaseChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
        Waiting for database telemetry logs...
      </div>
    )
  }

  const chartData = data.map((d) => ({
    time: formatTimeLabel(d.timestamp),
    rt: d.response_time,
    status: d.status
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={chartData}>
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="ms" />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload
              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-xl shadow-lg text-xs font-mono">
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">{item.time}</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Query Latency: {item.rt !== null ? `${item.rt.toFixed(1)} ms` : 'N/A'}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    Status:{' '}
                    <span className={item.status === 'Healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {item.status}
                    </span>
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="rt"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: '#818cf8', strokeWidth: 1 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
