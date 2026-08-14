import React, { useEffect } from 'react'
import { X, Server, Shield, HardDrive, Link } from 'lucide-react'

interface AddDatabaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  addDbProject: string
  setAddDbProject: (val: string) => void
  addDbName: string
  setAddDbName: (val: string) => void
  addDbType: string
  setAddDbType: (val: string) => void
  addDbHost: string
  setAddDbHost: (val: string) => void
  addDbPort: number
  setAddDbPort: (val: number) => void
  addDbDatabaseName: string
  setAddDbDatabaseName: (val: string) => void
  addDbUsername: string
  setAddDbUsername: (val: string) => void
  addDbPassword: string
  setAddDbPassword: (val: string) => void
  addDbConnectionUri: string
  setAddDbConnectionUri: (val: string) => void
  addDbProjectRef?: string
  setAddDbProjectRef?: (val: string) => void
  addDbApiKey?: string
  setAddDbApiKey?: (val: string) => void
  addDbCheckInterval: number
  setAddDbCheckInterval: (val: number) => void
}

export const AddDatabaseModal: React.FC<AddDatabaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addDbProject,
  setAddDbProject,
  addDbName,
  setAddDbName,
  addDbType,
  setAddDbType,
  addDbHost,
  setAddDbHost,
  addDbPort,
  setAddDbPort,
  addDbDatabaseName,
  setAddDbDatabaseName,
  addDbUsername,
  setAddDbUsername,
  addDbPassword,
  setAddDbPassword,
  addDbConnectionUri,
  setAddDbConnectionUri,
  addDbProjectRef,
  setAddDbProjectRef,
  addDbApiKey,
  setAddDbApiKey,
  addDbCheckInterval,
  setAddDbCheckInterval
}) => {
  // Update port based on type selection
  useEffect(() => {
    if (addDbType === 'MongoDB') {
      setAddDbPort(27017)
    } else if (addDbType === 'MySQL') {
      setAddDbPort(3306)
    } else {
      setAddDbPort(5432)
    }
  }, [addDbType, setAddDbPort])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
              <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Attach Database Target</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verify connection latency and DB health metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Section: General Configurations */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              1. General Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Project Scope</label>
                <input
                  type="text"
                  required
                  value={addDbProject}
                  onChange={(e) => setAddDbProject(e.target.value)}
                  placeholder="e.g. King Wins"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Database Label</label>
                <input
                  type="text"
                  required
                  value={addDbName}
                  onChange={(e) => setAddDbName(e.target.value)}
                  placeholder="e.g. Production Supabase"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Database Provider Type</label>
                <select
                  value={addDbType}
                  onChange={(e) => setAddDbType(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Supabase">Supabase PostgreSQL</option>
                  <option value="Neon">Neon Serverless PostgreSQL</option>
                  <option value="Local PostgreSQL">Local PostgreSQL</option>
                  <option value="AWS RDS PostgreSQL">AWS RDS PostgreSQL</option>
                  <option value="MySQL">MySQL Database</option>
                  <option value="MongoDB">MongoDB</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Probing Interval</label>
                <select
                  value={addDbCheckInterval}
                  onChange={(e) => setAddDbCheckInterval(parseInt(e.target.value, 10))}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                >
                  <option value={10}>Every 10 seconds</option>
                  <option value={30}>Every 30 seconds</option>
                  <option value={60}>Every 60 seconds (1 min)</option>
                  <option value={300}>Every 5 minutes</option>
                  <option value={600}>Every 10 minutes</option>
                  <option value={1800}>Every 30 minutes</option>
                  <option value={3600}>Every 1 hour</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4" />

          {/* Section: Connection Credentials */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              2. Credentials & Connection parameters
            </h4>

            {/* Connection URI Option */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Link className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Connection URI (Optional)
              </label>
              <textarea
                value={addDbConnectionUri}
                onChange={(e) => {
                  const val = e.target.value
                  setAddDbConnectionUri(val)
                  if (val && val.includes('://')) {
                    try {
                      const parsed = new URL(val)
                      if (parsed.hostname) setAddDbHost(parsed.hostname)
                      if (parsed.port) setAddDbPort(parseInt(parsed.port, 10))
                      if (parsed.username) setAddDbUsername(decodeURIComponent(parsed.username))
                      if (parsed.password) setAddDbPassword(decodeURIComponent(parsed.password))
                      if (parsed.pathname && parsed.pathname !== '/') setAddDbDatabaseName(parsed.pathname.replace(/^\//, ''))
                    } catch (err) {}
                  }
                }}
                placeholder="postgresql://user:pass@db.example.supabase.co:5432/postgres or mongodb+srv://..."
                rows={2}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Pasting a Connection URI will auto-fill endpoint details below and connect seamlessly.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Host / Endpoint URL</label>
                <input
                  type="text"
                  disabled={!!addDbConnectionUri}
                  required={!addDbConnectionUri}
                  value={addDbHost}
                  onChange={(e) => setAddDbHost(e.target.value)}
                  placeholder="db.example.supabase.co"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 disabled:opacity-40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Port</label>
                <input
                  type="number"
                  disabled={!!addDbConnectionUri}
                  required={!addDbConnectionUri}
                  value={addDbPort}
                  onChange={(e) => setAddDbPort(parseInt(e.target.value))}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 disabled:opacity-40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Database Name / Auth DB</label>
                <input
                  type="text"
                  disabled={!!addDbConnectionUri}
                  value={addDbDatabaseName}
                  onChange={(e) => setAddDbDatabaseName(e.target.value)}
                  placeholder="e.g. postgres"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 disabled:opacity-40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  disabled={!!addDbConnectionUri}
                  value={addDbUsername}
                  onChange={(e) => setAddDbUsername(e.target.value)}
                  placeholder="e.g. postgres"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 disabled:opacity-40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  disabled={!!addDbConnectionUri}
                  value={addDbPassword}
                  onChange={(e) => setAddDbPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 disabled:opacity-40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all"
            >
              Attach Database
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
