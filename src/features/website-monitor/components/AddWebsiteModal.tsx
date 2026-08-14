import React from 'react'
import { Sliders, X, ShieldAlert } from 'lucide-react'

interface AddWebsiteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  addWebProject: string
  setAddWebProject: (val: string) => void
  addWebName: string
  setAddWebName: (val: string) => void
  addWebUrl: string
  setAddWebUrl: (val: string) => void
  addWebExpectedStatus: number
  setAddWebExpectedStatus: (val: number) => void
  addWebInterval: number
  setAddWebInterval: (val: number) => void
}

export const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addWebProject,
  setAddWebProject,
  addWebName,
  setAddWebName,
  addWebUrl,
  setAddWebUrl,
  addWebExpectedStatus,
  setAddWebExpectedStatus,
  addWebInterval,
  setAddWebInterval
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Register New Website Monitor
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={addWebProject}
                  onChange={(e) => setAddWebProject(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                  placeholder="e.g. King Wins"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Monitor Name</label>
                <input
                  type="text"
                  value={addWebName}
                  onChange={(e) => setAddWebName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                  placeholder="e.g. King Wins API"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Target Endpoint URL</label>
              <input
                type="url"
                value={addWebUrl}
                onChange={(e) => setAddWebUrl(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                required
                placeholder="https://example.com/api/v1/health"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Expected HTTP Status</label>
                <input
                  type="number"
                  value={addWebExpectedStatus}
                  onChange={(e) => setAddWebExpectedStatus(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                  placeholder="200"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Check Frequency</label>
                <select
                  value={addWebInterval}
                  onChange={(e) => setAddWebInterval(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value={30}>Every 30 Seconds</option>
                  <option value={60}>Every 60 Seconds</option>
                  <option value={120}>Every 2 Minutes</option>
                  <option value={300}>Every 5 Minutes</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex gap-2.5">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Website monitors probe target endpoints directly from the MonitorDep backend server. Check logs record SSL expiries, latencies, and redirect locations.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30"
              >
                Register Monitor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
