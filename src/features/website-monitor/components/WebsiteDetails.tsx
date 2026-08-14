import React from 'react'
import { Sliders, ShieldCheck, ShieldAlert, Navigation, CheckCircle, XCircle } from 'lucide-react'
import { Website, WebsiteHistoryPoint } from '../../../types/website'
import { WebsiteHistoryChart } from '../../../components/charts/LineChart'

interface WebsiteDetailsProps {
  websiteDetail: Website | null
  history: WebsiteHistoryPoint[]
  uptimePercentage: number
  averageResponseTime: number
}

export const WebsiteDetails: React.FC<WebsiteDetailsProps> = ({
  websiteDetail,
  history,
  uptimePercentage,
  averageResponseTime
}) => {
  if (!websiteDetail) return null

  const hasCheck = !!websiteDetail.latest_check
  const check = websiteDetail.latest_check

  // Calculate remaining days for SSL Expiry Alert
  let sslRemainingDays: number | null = null
  let sslExpiryDateStr = 'Unknown'

  if (hasCheck && check?.ssl_expiry) {
    try {
      const expiry = new Date(check.ssl_expiry)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      sslRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      sslExpiryDateStr = expiry.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      // Ignore parsing errors
    }
  }

  const isSSLAlertActive = sslRemainingDays !== null && sslRemainingDays < 15

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100 pb-12">
      {/* Row 1: Probe Specifications & Settings */}
      <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Probe Specifications & Verification Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Target Endpoint URL</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate font-mono select-all" title={websiteDetail.url}>
              {websiteDetail.url}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Probed target address
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Expected HTTP Code</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {websiteDetail.expected_status || 200}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Target code match condition
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Probe Interval</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {websiteDetail.check_interval} seconds
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Cron loop frequency
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Verification Status</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {websiteDetail.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Active schedule status
            </span>
          </div>
        </div>
      </section>

      {/* Row 2: SSL Certs & Redirect Tracing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SSL Status Panel */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              SSL Certificate Authorization
            </h4>
            {hasCheck && check?.ssl_valid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
            )}
          </div>

          {hasCheck && check?.ssl_expiry ? (
            <div className="my-5 space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  {sslRemainingDays !== null ? sslRemainingDays : 'N/A'}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">days remaining</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expires on <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{sslExpiryDateStr}</span>
              </p>
            </div>
          ) : (
            <div className="my-5">
              <span className="text-sm text-slate-400 dark:text-slate-500 italic">No SSL data logs retrieved yet.</span>
            </div>
          )}

          {isSSLAlertActive && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/80 text-amber-700 dark:text-amber-400 rounded-xl text-xs flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                SSL certificate expires in less than 15 days! Renew certificate immediately.
              </span>
            </div>
          )}
        </section>

        {/* Redirect Destinations Panel */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              HTTP Redirect Tracing
            </h4>
            <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="my-5 space-y-2">
            {hasCheck && check?.redirected ? (
              <>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Redirect Detected (301/302)
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate select-all" title={check?.redirect_url || ''}>
                  {check?.redirect_url}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Direct Target Endpoint
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  The prober reached the endpoint direct without any permanent redirects or response forwarding hops.
                </p>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
            <span>Checked: {hasCheck && check?.checked_at ? new Date(check.checked_at).toLocaleString() : 'N/A'}</span>
            <span className="font-mono">IP: Direct Backend Probe</span>
          </div>
        </section>
      </div>

      {/* Row 3: Response Timeline Chart & Live Ratio Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency History Graph */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Probe Latency Timeline (ms)
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" /> Response Latency
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <WebsiteHistoryChart data={history} />
          </div>
        </section>

        {/* Uptime Ratio Gauge */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              Uptime Ratio Analysis
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Uptime Ratio</span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {uptimePercentage.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Mean Response Delay</span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {averageResponseTime.toFixed(0)} ms
                </span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">HTTP Response Status</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {hasCheck && check?.http_status !== null ? check?.http_status : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Uptime Condition</span>
            {hasCheck && check?.status === 'Online' ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5" />
                STABLE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1 rounded-lg">
                <XCircle className="w-3.5 h-3.5" />
                FAILING
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
