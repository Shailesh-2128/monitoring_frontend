import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { ModuleKey, PermissionLevel } from '../../../types/iam'
import {
  X, User as UserIcon, Shield, Users, Mail, Calendar, Clock,
  Briefcase, CheckCircle2, XCircle, Server, Globe, Database,
  GitBranch, Cloud, DollarSign, ShieldCheck
} from 'lucide-react'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const MODULE_DEFS: { key: ModuleKey; label: string; icon: React.ReactNode }[] = [
  { key: 'servers', label: 'Server Monitoring', icon: <Server className="w-4 h-4 text-blue-500" /> },
  { key: 'websites', label: 'Website Monitoring', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
  { key: 'databases', label: 'Database Monitoring', icon: <Database className="w-4 h-4 text-cyan-500" /> },
  { key: 'github', label: 'GitHub Monitoring', icon: <GitBranch className="w-4 h-4 text-purple-500" /> },
  { key: 'aws', label: 'AWS Cloud Monitoring', icon: <Cloud className="w-4 h-4 text-amber-500" /> },
  { key: 'aws_costing', label: 'AWS Costing', icon: <DollarSign className="w-4 h-4 text-green-500" /> },
  { key: 'iam', label: 'User & IAM Management', icon: <ShieldCheck className="w-4 h-4 text-indigo-500" /> },
]

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  if (!isOpen || !user) return null

  const profile = user.profile
  const roleName = profile?.role_details?.name || (profile?.is_superadmin || user.is_staff ? 'Superadmin / Admin' : 'Viewer')
  const teamName = profile?.team_details?.name || 'No Team Assigned'
  const userPermissions = (user.permissions || {}) as Record<string, PermissionLevel>

  const getBadge = (level: PermissionLevel = 'none') => {
    if (level === 'write') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          Read-Write
        </span>
      )
    }
    if (level === 'read') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30">
          Read-Only
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60">
        No Access
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transition-all">
        {/* Banner Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-600/30 border-2 border-white/20 shrink-0">
              {(user.first_name?.[0] || user.username[0] || 'U').toUpperCase()}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight text-white">
                  {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </h3>
                {profile?.is_superadmin && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-mono">
                    SUPERADMIN
                  </span>
                )}
                {user.is_active ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Account
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Disabled Account
                  </span>
                )}
              </div>

              <div className="text-xs text-indigo-200 flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> @{user.username}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {user.email || 'No email registered'}
                </span>
                {profile?.job_title && (
                  <span className="flex items-center gap-1 text-purple-300 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" /> {profile.job_title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details & Permissions Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-indigo-500" /> Assigned Role
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {roleName}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-purple-500" /> Assigned Team
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {teamName}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Date Joined
              </div>
              <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Last Login
              </div>
              <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {user.last_login ? new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
              </div>
            </div>
          </div>

          {/* Module Effective Permissions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Effective Service Module Security Matrix
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Role + Team Merged Scope</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-955/50 overflow-hidden">
              {MODULE_DEFS.map((mod) => {
                const level = userPermissions[mod.key] || (profile?.is_superadmin ? 'write' : 'none')
                return (
                  <div key={mod.key} className="p-3.5 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {mod.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{mod.label}</span>
                    </div>

                    {getBadge(level)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
