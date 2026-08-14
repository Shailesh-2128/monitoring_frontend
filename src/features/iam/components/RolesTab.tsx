import React from 'react'
import { Role, ModuleKey, PermissionLevel } from '../../../types/iam'
import { Shield, ShieldAlert, Plus, Check, Minus, Lock, Server, Globe, Database, GitBranch, Cloud, DollarSign, Users } from 'lucide-react'

interface RolesTabProps {
  roles: Role[]
  canWrite: boolean
  onAddRole: () => void
}

const MODULE_DEFINITIONS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: 'servers', label: 'Server Monitoring', icon: <Server className="w-4 h-4 text-blue-500" /> },
  { key: 'websites', label: 'Website Monitoring', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
  { key: 'databases', label: 'Database Monitoring', icon: <Database className="w-4 h-4 text-cyan-500" /> },
  { key: 'github', label: 'GitHub Monitoring', icon: <GitBranch className="w-4 h-4 text-purple-500" /> },
  { key: 'aws', label: 'AWS Cloud Monitoring', icon: <Cloud className="w-4 h-4 text-amber-500" /> },
  { key: 'aws_costing', label: 'AWS Costing', icon: <DollarSign className="w-4 h-4 text-green-500" /> },
  { key: 'iam', label: 'IAM User Management', icon: <Users className="w-4 h-4 text-indigo-500" /> },
]

export const RolesTab: React.FC<RolesTabProps> = ({ roles, canWrite, onAddRole }) => {
  const getBadge = (level: PermissionLevel = 'none') => {
    if (level === 'write') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          <Check className="w-3.5 h-3.5" /> Read-Write
        </span>
      )
    }
    if (level === 'read') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
          <Check className="w-3.5 h-3.5" /> Read Only
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60">
        <Minus className="w-3 h-3" /> None
      </span>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">IAM Roles & Permission Matrix</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure fine-grained module access controls per role.</p>
        </div>
        {canWrite && (
          <button
            onClick={onAddRole}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        )}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-5 min-w-[220px]">Module / Service</th>
                {roles.map((r) => (
                  <th key={r.id} className="py-4 px-5 min-w-[170px]">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      <span>{r.name}</span>
                    </div>
                    {r.is_system_role && (
                      <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mt-1 inline-block">
                        SYSTEM ROLE
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {MODULE_DEFINITIONS.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white">
                      {mod.icon}
                      <span>{mod.label}</span>
                    </div>
                  </td>
                  {roles.map((r) => {
                    const level = (r.permissions || {})[mod.key] || (r.name.includes('Admin') ? 'write' : 'none')
                    return (
                      <td key={r.id} className="py-4 px-5">
                        {getBadge(level)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Cards list with descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {roles.map((role) => (
          <div key={role.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-indigo-500" />
                {role.name}
              </h4>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {role.profiles_count || 0} Assigned Users
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {role.description || 'Custom defined IAM role.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
