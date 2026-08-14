import React from 'react'
import { User, ModuleKey, PermissionLevel } from '../../../types/iam'
import { X, UserCheck, Shield, Users, Mail, Calendar, Clock, Briefcase, CheckCircle2, XCircle, Server, Globe, Database, GitBranch, Cloud, DollarSign, Check, Minus } from 'lucide-react'

interface UserDetailsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
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

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null

  const isSuper = user.profile?.is_superadmin || user.is_staff
  const roleName = user.profile?.role_details?.name || (isSuper ? 'Superadmin / Admin' : 'Unassigned')
  const teamName = user.profile?.team_details?.name || 'No Team Assigned'
  const jobTitle = user.profile?.job_title || 'Engineering Member'
  const permissions = (user.permissions || {}) as Record<string, PermissionLevel>

  const getPermissionBadge = (level: PermissionLevel = 'none') => {
    if (level === 'write') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          <Check className="w-3.5 h-3.5" /> Read-Write
        </span>
      )
    }
    if (level === 'read') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/30">
          <Check className="w-3.5 h-3.5" /> Read-Only
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
        <Minus className="w-3 h-3" /> None
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white border-b border-indigo-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg shrink-0 ${
              isSuper
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/30 text-white'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                </h3>
                {isSuper && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    SUPERADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200 font-mono mt-0.5 flex items-center gap-2">
                <span>{user.email}</span>
                <span>•</span>
                <span>@{user.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</div>
              <div>
                {user.is_active ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <XCircle className="w-4 h-4" /> Disabled
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Job Position</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{jobTitle}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Assigned Team</div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{teamName}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Assigned Role</div>
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">{roleName}</div>
            </div>
          </div>

          {/* Account Timestamps */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: <strong className="text-slate-900 dark:text-white">{new Date(user.date_joined).toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last Login: <strong className="text-slate-900 dark:text-white">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never logged in'}</strong></span>
            </div>
          </div>

          {/* Effective Module Permissions Matrix */}
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Effective Service Module Permissions</span>
              <span className="text-xs font-normal text-slate-400 font-mono">Role + Team Scope</span>
            </h4>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
              {MODULE_DEFINITIONS.map((mod) => {
                const level = permissions[mod.key] || (isSuper ? 'write' : 'none')
                return (
                  <div key={mod.key} className="p-3.5 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      {mod.icon}
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{mod.label}</span>
                    </div>
                    <div>
                      {getPermissionBadge(level)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
