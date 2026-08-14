import React, { useState } from 'react'
import { ModuleKey, PermissionLevel, PermissionMap } from '../../../types/iam'
import { X, Users, Server, Globe, Database, GitBranch, Cloud, DollarSign, Shield, Send } from 'lucide-react'

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (teamData: { name: string; description: string; permissions: PermissionMap }) => Promise<void>
}

const MODULES: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: 'servers', label: 'Server Monitoring', icon: <Server className="w-4 h-4 text-blue-500" /> },
  { key: 'websites', label: 'Website Monitoring', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
  { key: 'databases', label: 'Database Monitoring', icon: <Database className="w-4 h-4 text-cyan-500" /> },
  { key: 'github', label: 'GitHub Monitoring', icon: <GitBranch className="w-4 h-4 text-purple-500" /> },
  { key: 'aws', label: 'AWS Cloud Monitoring', icon: <Cloud className="w-4 h-4 text-amber-500" /> },
  { key: 'aws_costing', label: 'AWS Costing', icon: <DollarSign className="w-4 h-4 text-green-500" /> },
  { key: 'telegram', label: 'Telegram Notifications', icon: <Send className="w-4 h-4 text-sky-500" /> },
]

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<PermissionMap>({
    servers: 'read',
    websites: 'read',
    databases: 'read',
    github: 'read',
    aws: 'read',
    aws_costing: 'none',
    telegram: 'read',
    iam: 'none',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handlePermissionChange = (module: ModuleKey, level: PermissionLevel) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: level,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({ name, description, permissions })
      setName('')
      setDescription('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl transition-all">
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-b border-indigo-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Create Engineering Team & Access Scope</h3>
              <p className="text-xs text-indigo-200 mt-0.5">Group members and define team-level service module permissions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS & Cloud Operations Team"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities and purpose of this engineering team..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Module Access Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Team Module Permission Controls</span>
            </label>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-955/40">
              {MODULES.map((mod) => {
                const currentLevel = permissions[mod.key] || 'none'
                return (
                  <div key={mod.key} className="p-3 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      {mod.icon}
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{mod.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePermissionChange(mod.key, 'none')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          currentLevel === 'none'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600'
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        None
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermissionChange(mod.key, 'read')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          currentLevel === 'read'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50'
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        Read-Only
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermissionChange(mod.key, 'write')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          currentLevel === 'write'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50'
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        Read-Write
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              {loading ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
