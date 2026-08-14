import React, { useState } from 'react'
import { X, DollarSign, Bell, Tag } from 'lucide-react'
import { AWSAccount, AWSBudget } from '../../../types/aws'

interface AddAWSBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  awsAccounts: AWSAccount[]
  selectedAccountId?: number | null
  onSaveBudget: (budgetData: {
    aws_account: number
    name: string
    monthly_budget: number
    currency: string
    email_alert?: string
    enabled: boolean
  }) => Promise<void>
}

export const AddAWSBudgetModal: React.FC<AddAWSBudgetModalProps> = ({
  isOpen,
  onClose,
  awsAccounts,
  selectedAccountId,
  onSaveBudget
}) => {
  const [awsAccount, setAwsAccount] = useState<number>(
    selectedAccountId || (awsAccounts.length > 0 ? awsAccounts[0].id : 1)
  )
  const [name, setName] = useState('Monthly AWS Production Budget')
  const [monthlyBudget, setMonthlyBudget] = useState('50.00')
  const [currency, setCurrency] = useState('USD')
  const [emailAlert, setEmailAlert] = useState('admin@kingwins.pro')
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide a budget name.')
      return
    }
    const val = parseFloat(monthlyBudget)
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid monthly budget amount.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onSaveBudget({
        aws_account: awsAccount,
        name: name.trim(),
        monthly_budget: val,
        currency,
        email_alert: emailAlert.trim() || undefined,
        enabled
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save AWS Budget.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 font-sans text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Create AWS Budget</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set spending limit & receive threshold notifications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* AWS Account Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">AWS Account</label>
            <select
              value={awsAccount}
              onChange={(e) => setAwsAccount(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {awsAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name || acc.name} ({acc.region})
                </option>
              ))}
            </select>
          </div>

          {/* Budget Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Budget Name</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly AWS Production Budget"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Monthly Budget & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Budget Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="50.00"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Email Alert */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Alert Recipient</label>
            <div className="relative">
              <Bell className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={emailAlert}
                onChange={(e) => setEmailAlert(e.target.value)}
                placeholder="devops@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Budget Active</span>
              <p className="text-[10px] text-slate-400">Enable automated warning alerts on budget exceed</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Saving Budget...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
