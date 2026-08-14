import React from 'react'
import { Team, ModuleKey, PermissionLevel } from '../../../types/iam'
import { Users, Plus, Shield, Calendar, Trash2, Check, Minus } from 'lucide-react'

interface TeamsTabProps {
  teams: Team[]
  canWrite: boolean
  onAddTeam: () => void
  onDeleteTeam: (teamId: number) => void
}

const MODULE_LABELS: Record<ModuleKey, string> = {
  servers: 'Servers',
  websites: 'Websites',
  databases: 'Databases',
  github: 'GitHub',
  aws: 'AWS Cloud',
  aws_costing: 'AWS Costing',
  telegram: 'Telegram',
  iam: 'IAM Users',
}

export const TeamsTab: React.FC<TeamsTabProps> = ({ teams, canWrite, onAddTeam, onDeleteTeam }) => {
  const getBadge = (level: PermissionLevel = 'none') => {
    if (level === 'write') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
          R/W
        </span>
      )
    }
    if (level === 'read') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
          Read
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60">
        None
      </span>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Organizational Teams</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Group IAM members and configure team module permissions scope.</p>
        </div>
        {canWrite && (
          <button
            onClick={onAddTeam}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const perms = (team.permissions || {}) as Record<string, PermissionLevel>
          return (
            <div
              key={team.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {team.members_count || 0} Members
                    </span>
                    {canWrite && (
                      <button
                        onClick={() => onDeleteTeam(team.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{team.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {team.description || 'No description provided.'}
                </p>

                {/* Team Module Permissions Scope summary */}
                <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Team Access Scope
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(MODULE_LABELS) as ModuleKey[]).map((key) => {
                      if (key === 'iam') return null
                      return (
                        <div key={key} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">{MODULE_LABELS[key]}</span>
                          {getBadge(perms[key])}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>TEAM ID: #{team.id}</span>
                {team.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(team.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
