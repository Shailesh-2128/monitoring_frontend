import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Role, Team } from '../../types/iam'
import { UsersTab } from './components/UsersTab'
import { TeamsTab } from './components/TeamsTab'
import { RolesTab } from './components/RolesTab'
import { AuditLogsTab } from './components/AuditLogsTab'
import { CreateUserModal } from './components/CreateUserModal'
import { CreateTeamModal } from './components/CreateTeamModal'
import { CreateRoleModal } from './components/CreateRoleModal'
import { UserDetailsModal } from './components/UserDetailsModal'
import { ShieldCheck, Users, Shield, RefreshCw, AlertTriangle, UserCheck, Activity } from 'lucide-react'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export const UserManagement: React.FC = () => {
  const { token, hasPermission } = useAuth()
  const canWrite = hasPermission('iam', 'write')

  const [activeTab, setActiveTab] = useState<'users' | 'teams' | 'roles' | 'audit-logs'>('users')
  
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Modal open states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [usersRes, rolesRes, teamsRes] = await Promise.all([
        fetch(`${API_BASE}/api/iam/users/`, { headers }),
        fetch(`${API_BASE}/api/iam/roles/`, { headers }),
        fetch(`${API_BASE}/api/iam/teams/`, { headers }),
      ])

      if (!usersRes.ok || !rolesRes.ok || !teamsRes.ok) {
        throw new Error('Failed to load IAM resources from server.')
      }

      const usersData = await usersRes.json()
      const rolesData = await rolesRes.json()
      const teamsData = await teamsRes.json()

      setUsers(Array.isArray(usersData) ? usersData : usersData.results || [])
      setRoles(Array.isArray(rolesData) ? rolesData : rolesData.results || [])
      setTeams(Array.isArray(teamsData) ? teamsData : teamsData.results || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error fetching IAM data.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateUser = async (userData: any) => {
    const res = await fetch(`${API_BASE}/api/iam/users/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || Object.values(data).flat().join(', ') || 'Failed to create user')
    }
    fetchData()
  }

  const handleCreateTeam = async (teamData: { name: string; description: string; permissions: any }) => {
    const res = await fetch(`${API_BASE}/api/iam/teams/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamData)
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || Object.values(data).flat().join(', ') || 'Failed to create team')
    }
    fetchData()
  }

  const handleDeleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return
    try {
      const res = await fetch(`${API_BASE}/api/iam/teams/${teamId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateRole = async (roleData: { name: string; description: string; permissions: any }) => {
    const res = await fetch(`${API_BASE}/api/iam/roles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || Object.values(data).flat().join(', ') || 'Failed to create role')
    }
    fetchData()
  }

  const handleToggleUserActive = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/iam/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this IAM user?')) return
    try {
      const res = await fetch(`${API_BASE}/api/iam/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const activeUsersCount = users.filter((u) => u.is_active).length
  const superadminCount = users.filter((u) => u.profile?.is_superadmin || u.is_staff).length

  return (
    <div className="space-y-6 font-sans">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-6 md:p-8 text-white shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 backdrop-blur-md shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 font-mono">
                  SECURITY & GOVERNANCE // IAM V2
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Identity & Access Management
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Provision engineering team accounts, assign customizable role matrices, and enforce fine-grained module level security policies across your monitoring infrastructure.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-lg shrink-0 hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh IAM Data</span>
          </button>
        </div>

        {/* Quick KPI Stat Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-indigo-200">IAM Users</div>
            <div className="text-xl font-black text-white flex items-center justify-between mt-1">
              <span>{users.length}</span>
              <span className="text-xs font-normal text-emerald-400 font-mono">{activeUsersCount} Active</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-purple-200">Teams</div>
            <div className="text-xl font-black text-white flex items-center justify-between mt-1">
              <span>{teams.length}</span>
              <span className="text-xs font-normal text-purple-300 font-mono">Units</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-cyan-200">Roles & Matrix</div>
            <div className="text-xl font-black text-white flex items-center justify-between mt-1">
              <span>{roles.length}</span>
              <span className="text-xs font-normal text-cyan-300 font-mono">Configured</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-amber-200">Superadmins</div>
            <div className="text-xl font-black text-white flex items-center justify-between mt-1">
              <span>{superadminCount}</span>
              <span className="text-xs font-normal text-amber-300 font-mono">Full Access</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pill Style Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>IAM Users</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeTab === 'users' ? 'bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'teams'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teams</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeTab === 'teams' ? 'bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {teams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'roles'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Roles & Permissions Matrix</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeTab === 'roles' ? 'bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {roles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'audit-logs'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* Main Tab Area */}
      {loading && activeTab !== 'audit-logs' ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide uppercase">Syncing IAM Security Policies...</span>
        </div>
      ) : (
        <>
          {activeTab === 'users' && (
            <UsersTab
              users={users}
              roles={roles}
              teams={teams}
              canWrite={canWrite}
              onAddUser={() => setIsCreateUserOpen(true)}
              onToggleActive={handleToggleUserActive}
              onDeleteUser={handleDeleteUser}
              onSelectUser={(user) => {
                setSelectedUserDetail(user)
                setIsUserDetailsOpen(true)
              }}
            />
          )}

          {activeTab === 'teams' && (
            <TeamsTab
              teams={teams}
              canWrite={canWrite}
              onAddTeam={() => setIsCreateTeamOpen(true)}
              onDeleteTeam={handleDeleteTeam}
            />
          )}

          {activeTab === 'roles' && (
            <RolesTab
              roles={roles}
              canWrite={canWrite}
              onAddRole={() => setIsCreateRoleOpen(true)}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsTab />
          )}
        </>
      )}

      {/* Styled Modals */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        roles={roles}
        teams={teams}
        onClose={() => setIsCreateUserOpen(false)}
        onSubmit={handleCreateUser}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSubmit={handleCreateTeam}
      />

      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        onSubmit={handleCreateRole}
      />

      <UserDetailsModal
        user={selectedUserDetail}
        isOpen={isUserDetailsOpen}
        onClose={() => setIsUserDetailsOpen(false)}
      />
    </div>
  )
}
