import React, { useState } from 'react'
import { User, Role, Team } from '../../../types/iam'
import { UserCheck, Shield, Users, Edit3, Trash2, CheckCircle2, XCircle, Search, UserPlus, Mail, Briefcase, Eye } from 'lucide-react'

interface UsersTabProps {
  users: User[]
  roles: Role[]
  teams: Team[]
  canWrite: boolean
  onAddUser: () => void
  onToggleActive: (userId: number, currentStatus: boolean) => void
  onDeleteUser: (userId: number) => void
  onSelectUser: (user: User) => void
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  roles,
  teams,
  canWrite,
  onAddUser,
  onToggleActive,
  onDeleteUser,
  onSelectUser
}) => {
  const [search, setSearch] = useState('')

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(term) ||
      (u.profile?.role_details?.name || '').toLowerCase().includes(term) ||
      (u.profile?.team_details?.name || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 font-sans">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, email, role, team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {canWrite && (
          <button
            onClick={onAddUser}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create IAM User</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-5">User Profile (Click to View)</th>
                <th className="py-4 px-5">Role Privileges</th>
                <th className="py-4 px-5">Engineering Team</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5">Joined Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No IAM users found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleName = u.profile?.role_details?.name || (u.profile?.is_superadmin ? 'Superadmin / Admin' : 'Unassigned')
                  const teamName = u.profile?.team_details?.name || 'No Team'
                  const isSuper = u.profile?.is_superadmin || u.is_staff
                  const jobTitle = u.profile?.job_title

                  return (
                    <tr
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0 transition-transform group-hover:scale-105 ${
                            isSuper
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20'
                              : 'bg-slate-700 dark:bg-slate-800'
                          }`}>
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              <span>{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</span>
                              {isSuper && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                                  SUPERADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{u.email}</span>
                              {jobTitle && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                  • {jobTitle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                          roleName.includes('Admin')
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                            : roleName.includes('DevOps')
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            : roleName.includes('Developer')
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                          {roleName}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
                          {teamName}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectUser(u)}
                            className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all"
                            title="View User Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canWrite && (
                            <>
                              <button
                                onClick={() => onToggleActive(u.id, u.is_active)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                  u.is_active
                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.is_active ? 'Disable' : 'Enable'}
                              </button>

                              {!isSuper && (
                                <button
                                  onClick={() => onDeleteUser(u.id)}
                                  className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
