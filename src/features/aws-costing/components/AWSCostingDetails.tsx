import React, { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  Globe,
  Award,
  Zap,
  Download,
  Calendar,
  Filter,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileCode
} from 'lucide-react'
import {
  AWSAccount,
  AWSBudget,
  AWSCostOverview,
  AWSDailyCostTrendPoint,
  AWSServiceCost,
  AWSRegionCost,
  AWSCostForecast,
  AWSCostRecommendation
} from '../../../types/aws'

interface AWSCostingDetailsProps {
  awsAccounts: AWSAccount[]
  selectedAccountId: number | null
  onSelectAccount: (id: number) => void
  onAddAccount: () => void
  overview: AWSCostOverview | null
  dailyTrend: AWSDailyCostTrendPoint[]
  trendDays: number
  onChangeTrendDays: (days: number) => void
  serviceCosts: AWSServiceCost[]
  regionCosts: AWSRegionCost[]
  costForecast: AWSCostForecast | null
  budgets: AWSBudget[]
  recommendations: AWSCostRecommendation[]
  totalSavings: number
  loading: boolean
  onRefresh: () => void
  onOpenAddBudgetModal: () => void
  onDeleteBudget: (id: number) => Promise<void>
  onDeleteAccount?: (id: number) => void
  onExportReport: (params: {
    format: 'csv' | 'excel' | 'pdf'
    startDate?: string
    endDate?: string
    service?: string
    region?: string
  }) => void
}

export const AWSCostingDetails: React.FC<AWSCostingDetailsProps> = ({
  awsAccounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  overview,
  dailyTrend,
  trendDays,
  onChangeTrendDays,
  serviceCosts,
  regionCosts,
  costForecast,
  budgets,
  recommendations,
  totalSavings,
  loading,
  onRefresh,
  onOpenAddBudgetModal,
  onDeleteBudget,
  onDeleteAccount,
  onExportReport
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'pie' | 'table'>('pie')
  const [filterService, setFilterService] = useState('All')
  const [filterRegion, setFilterRegion] = useState('All')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const activeAccount = awsAccounts.find((a) => a.id === selectedAccountId) || awsAccounts[0]

  // Default zero metrics if overview not loaded
  const safeOverview: AWSCostOverview = overview || {
    current_month_cost: 0.0,
    today_cost: 0.0,
    yesterday_cost: 0.0,
    forecast_cost: 0.0,
    monthly_budget: 0.0,
    remaining_budget: 0.0,
    spent_percentage: 0.0,
    permission_granted: true
  }

  const maxTrendCost = Math.max(...(dailyTrend || []).map((t) => t.cost), 5)

  // Color mapping for AWS services
  const getServiceColor = (service: string, index: number) => {
    const colors = [
      '#6366f1', // Indigo
      '#3b82f6', // Blue
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Purple
      '#14b8a6', // Teal
      '#64748b'  // Slate
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100 pb-16">
      {/* Account Selector & Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden border border-indigo-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AWS Cost Explorer Active
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              AWS Costing Dashboard
            </h1>

            {/* AWS Account Selector Dropdown */}
            {awsAccounts.length > 0 && (
              <div className="relative inline-block">
                <select
                  value={selectedAccountId || activeAccount?.id}
                  onChange={(e) => onSelectAccount(Number(e.target.value))}
                  className="appearance-none bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 pr-10 rounded-2xl text-xs font-bold text-white focus:outline-none cursor-pointer backdrop-blur-md transition-all"
                >
                  {awsAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                      {acc.account_name || acc.name} ({acc.region})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/70 absolute right-3 top-3 pointer-events-none" />
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Real-time AWS cloud spending telemetry, daily cost trends, region breakdown, 95% confidence cost forecasts, budget alerts, and automated CloudWatch cost recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <button
            onClick={onAddAccount}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add AWS Credentials
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            Sync Cost Explorer
          </button>

          {onDeleteAccount && activeAccount && (
            <button
              onClick={() => onDeleteAccount(activeAccount.id)}
              className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-2xl text-xs font-bold transition-all backdrop-blur-md flex items-center gap-2 hover:scale-105"
              title={`Delete ${activeAccount.account_name || activeAccount.name}`}
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          )}
        </div>
      </div>

      {/* IAM Permission / Connection Alert Banner */}
      {(!safeOverview.permission_granted || overview?.error_message) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-2xl flex items-start gap-3 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs leading-relaxed">
            <p className="font-bold text-amber-300">AWS IAM Permissions / Cost Explorer Required</p>
            <p>
              To fetch live AWS Cost Explorer telemetry, your AWS Access Key needs IAM policy permissions: <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300">ce:GetCostAndUsage</code>, <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300">ce:GetCostForecast</code>, and <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300">ce:GetDimensionValues</code>.
            </p>
            {overview?.error_message && (
              <p className="font-mono text-[11px] text-amber-400/90 pt-1">
                Diagnostic Error: {overview.error_message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Feature 1: Cost Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            1. Cost Overview
          </h2>
          <span className="text-xs text-slate-400 font-mono">Currency: USD ($)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1: Current Month Cost */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-emerald-500/50 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Month</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ${safeOverview.current_month_cost.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Actual Month-to-Date
            </div>
          </div>

          {/* Card 2: Today's Cost */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-indigo-500/50 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Cost</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ${safeOverview.today_cost.toFixed(2)}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Live Hourly Run-Rate
            </div>
          </div>

          {/* Card 3: Yesterday's Cost */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-slate-400 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yesterday's Cost</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ${safeOverview.yesterday_cost.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Finalized Billing
            </div>
          </div>

          {/* Card 4: Forecast */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-amber-500/50 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Forecast</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              ${safeOverview.forecast_cost.toFixed(2)}
            </div>
            <div className="text-[10px] text-amber-500 font-semibold">
              GetCostForecast Projection
            </div>
          </div>

          {/* Card 5: Budget */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-blue-500/50 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Budget</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              ${safeOverview.monthly_budget.toFixed(2)}
            </div>
            <div className="text-[10px] text-blue-500 font-semibold">
              Configured Limit
            </div>
          </div>

          {/* Card 6: Remaining Budget */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2 hover:border-purple-500/50 transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
            <div className={`text-2xl font-black font-mono ${
              safeOverview.remaining_budget < 0 ? 'text-rose-500' : 'text-emerald-500'
            }`}>
              ${safeOverview.remaining_budget.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {safeOverview.spent_percentage}% Spent
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Daily Cost Trend Chart */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              2. Daily Cost Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data source: Cost Explorer <code className="text-indigo-600 font-mono">GetCostAndUsage</code> (Granularity = DAILY)
            </p>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => onChangeTrendDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${
                  trendDays === d
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* SVG Daily Trend Chart */}
        <div className="pt-4">
          {dailyTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              Loading Daily Cost Trend Data...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 flex items-end justify-between gap-1.5 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 px-2 overflow-x-auto">
                {dailyTrend.map((pt, idx) => {
                  const heightPct = Math.max(12, Math.round((pt.cost / maxTrendCost) * 100))
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[20px] flex flex-col items-center gap-2 group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                        {pt.date}: ${pt.cost.toFixed(2)}
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-lg h-full flex items-end overflow-hidden">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 group-hover:from-indigo-500 group-hover:to-emerald-300 transition-all rounded-t-lg shadow-sm"
                        />
                      </div>

                      {/* Display date label every few ticks */}
                      {(idx % Math.ceil(dailyTrend.length / 10) === 0 || idx === dailyTrend.length - 1) && (
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[40px]">
                          {pt.date.slice(5)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-2">
                <span>Start Date: <strong className="font-mono text-slate-700 dark:text-slate-300">{dailyTrend[0]?.date}</strong></span>
                <span>End Date: <strong className="font-mono text-slate-700 dark:text-slate-300">{dailyTrend[dailyTrend.length - 1]?.date}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid for Features 3 & 4: Cost by AWS Service & Cost by Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 3: Cost by AWS Service */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                3. Cost by AWS Service
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">EC2, S3, CloudWatch, EBS, RDS, Route53, Lambda</p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
              <button
                onClick={() => setActiveChartTab('pie')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeChartTab === 'pie'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pie Chart
              </button>
              <button
                onClick={() => setActiveChartTab('table')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeChartTab === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {activeChartTab === 'pie' ? (
            <div className="space-y-4">
              {/* Service progress visual distribution */}
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                {serviceCosts.map((s, idx) => (
                  <div
                    key={s.service}
                    style={{
                      width: `${s.percentage}%`,
                      backgroundColor: getServiceColor(s.service, idx)
                    }}
                    title={`${s.service}: $${s.cost} (${s.percentage}%)`}
                    className="h-full transition-all hover:opacity-80"
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {serviceCosts.map((s, idx) => (
                  <div
                    key={s.service}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: getServiceColor(s.service, idx) }}
                      />
                      <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                        {s.service}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                        ${s.cost.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {s.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">AWS Service</th>
                    <th className="py-2.5 px-3">Monthly Cost</th>
                    <th className="py-2.5 px-3">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {serviceCosts.map((s, idx) => (
                    <tr key={s.service} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getServiceColor(s.service, idx) }}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{s.service}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">${s.cost.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${s.percentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-500">{s.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feature 4: Cost by Region */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              4. Cost by Region
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Spending breakdown across AWS global locations</p>
          </div>

          <div className="space-y-4">
            {regionCosts.map((r) => (
              <div
                key={r.region}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{r.region_name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                      {r.region}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-base">${r.cost.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">{r.percentage}% of total</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid for Features 5 & 6: Cost Forecast & Budget Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature 5: Cost Forecast */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border border-amber-500/30 rounded-3xl shadow-sm space-y-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
              AWS Cost Explorer Engine
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-2">
              <Zap className="w-5 h-5 text-amber-500" />
              5. Cost Forecast
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Uses <code className="text-amber-600 font-mono">GetCostForecast</code> with 95% Confidence Bounds</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow-md flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Month-End Forecast</span>
              <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                ${(costForecast?.forecast_amount || safeOverview.forecast_cost).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Expected total end of current billing cycle</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-500">
                {costForecast?.confidence_level || 95}%
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                High Precision
              </span>
            </div>
          </div>
        </div>

        {/* Feature 6: Budget Management */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                6. Budget Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create, monitor, and enforce monthly AWS spending limits</p>
            </div>

            <button
              onClick={onOpenAddBudgetModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Budget
            </button>
          </div>

          {/* Active Budget Progress Widget */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Dashboard Budget Progress</span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{safeOverview.budget_name || 'Production Budget'}</h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-black ${
                safeOverview.spent_percentage > 90
                  ? 'bg-rose-500/20 text-rose-500'
                  : 'bg-emerald-500/20 text-emerald-500'
              }`}>
                {safeOverview.spent_percentage}% Spent
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans uppercase">Budget</span>
                <span className="font-bold text-slate-900 dark:text-white">${safeOverview.monthly_budget.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans uppercase">Spent</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">${safeOverview.current_month_cost.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans uppercase">Remaining</span>
                <span className={`font-bold ${safeOverview.remaining_budget < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  ${safeOverview.remaining_budget.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  safeOverview.spent_percentage > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, safeOverview.spent_percentage)}%` }}
              />
            </div>
          </div>

          {/* List of Configured Budgets */}
          {budgets.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Configured Budgets</span>
              {budgets.map((b) => (
                <div key={b.id} className="p-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                    <p className="text-[10px] text-slate-400">{b.email_alert ? `Alerts: ${b.email_alert}` : 'No email alerts'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white">${parseFloat(String(b.monthly_budget)).toFixed(2)}</span>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature 7: Cost Recommendations */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-500" />
              7. Cost Recommendations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Combine Cost Explorer + CloudWatch telemetry to eliminate idle AWS spending</p>
          </div>

          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>Potential Monthly Savings:</span>
            <span className="font-mono text-base font-black">${totalSavings.toFixed(2)}/month</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase">
                  {rec.resource_type}
                </span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  Save ${rec.estimated_savings.toFixed(2)}/mo
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{rec.resource_name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{rec.metric_summary}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{rec.recommendation}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 8: Reports & Export Controls */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl space-y-6 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              8. Cost Reports & Exports
            </h2>
            <p className="text-xs text-slate-300">Filter and export detailed AWS billing reports in CSV, Excel, or PDF format</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">AWS Service</label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All" className="bg-slate-900 text-white">All AWS Services</option>
              {serviceCosts.map((s) => (
                <option key={s.service} value={s.service} className="bg-slate-900 text-white">
                  {s.service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">AWS Region</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All" className="bg-slate-900 text-white">All Regions</option>
              {regionCosts.map((r) => (
                <option key={r.region} value={r.region} className="bg-slate-900 text-white">
                  {r.region_name} ({r.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() =>
              onExportReport({
                format: 'csv',
                startDate: filterStartDate,
                endDate: filterEndDate,
                service: filterService,
                region: filterRegion
              })
            }
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-105"
          >
            <FileCode className="w-4 h-4" />
            Export CSV Report
          </button>

          <button
            onClick={() =>
              onExportReport({
                format: 'excel',
                startDate: filterStartDate,
                endDate: filterEndDate,
                service: filterService,
                region: filterRegion
              })
            }
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel (.xlsx)
          </button>

          <button
            onClick={() =>
              onExportReport({
                format: 'pdf',
                startDate: filterStartDate,
                endDate: filterEndDate,
                service: filterService,
                region: filterRegion
              })
            }
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 hover:scale-105"
          >
            <FileText className="w-4 h-4" />
            Export PDF Summary
          </button>
        </div>
      </div>
    </div>
  )
}
