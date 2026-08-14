import React, { useState } from 'react'
import {
  Activity,
  Server as ServerIcon,
  Globe,
  Database as DatabaseIcon,
  Cloud,
  Plus,
  ChevronRight,
  Menu,
  X as CloseIcon,
  DollarSign,
  ShieldCheck,
  User as UserIcon,
  Shield,
  Eye,
  Send
} from 'lucide-react'
import { Github } from '../common/GithubIcon'
import { Server } from '../../types/server'
import { Website } from '../../types/website'
import { Database } from '../../types/database'
import { GitHubProject } from '../../types/github'
import { AWSAccount } from '../../types/aws'
import { useAuth } from '../../hooks/useAuth'
import { UserProfileModal } from '../../features/iam/components/UserProfileModal'

export type TabType = 'servers' | 'websites' | 'databases' | 'github' | 'aws' | 'aws-costing' | 'telegram' | 'iam'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  servers: Server[]
  websites: Website[]
  databases: Database[]
  githubProjects: GitHubProject[]
  awsAccounts?: AWSAccount[]
  setSelectedServerId: (id: number | null) => void
  setSelectedWebsiteId: (id: number | null) => void
  setSelectedDatabaseId: (id: number | null) => void
  setSelectedGithubProjectId: (id: number | null) => void
  setSelectedAWSAccountId: (id: number | null) => void
  autoRefresh: boolean
  setAutoRefresh: (refresh: boolean) => void
  setIsAddModalOpen: (open: boolean) => void
  setIsAddWebsiteModalOpen: (open: boolean) => void
  setIsAddDatabaseModalOpen: (open: boolean) => void
  setIsAddGithubModalOpen: (open: boolean) => void
  setIsAddAWSModalOpen: (open: boolean) => void
  setJustCreatedCredentials: (cred: any) => void
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 font-sans z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
            MonitorDep
          </span>
        </div>

        <button
          aria-label="Toggle Navigation Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
        >
          {mobileOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] bg-white dark:bg-slate-955 h-full flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">MonitorDep</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <SidebarNavItems {...props} closeMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Main Sidebar */}
      <aside className="hidden lg:flex w-72 h-full max-h-screen border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-955 flex-col shrink-0 font-sans transition-colors duration-200 overflow-hidden">
        <SidebarNavItems {...props} />
      </aside>
    </>
  )
}

const SidebarNavItems: React.FC<SidebarProps & { closeMobile?: () => void }> = ({
  activeTab,
  setActiveTab,
  servers,
  websites,
  databases,
  githubProjects,
  awsAccounts,
  setSelectedServerId,
  setSelectedWebsiteId,
  setSelectedDatabaseId,
  setSelectedGithubProjectId,
  setSelectedAWSAccountId,
  autoRefresh,
  setAutoRefresh,
  setIsAddModalOpen,
  setIsAddWebsiteModalOpen,
  setIsAddDatabaseModalOpen,
  setIsAddGithubModalOpen,
  setIsAddAWSModalOpen,
  setJustCreatedCredentials,
  closeMobile
}) => {
  const { user, hasPermission } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const safeServers = servers || []
  const safeWebsites = websites || []
  const safeDatabases = databases || []
  const safeGithubProjects = githubProjects || []
  const safeAWSAccounts = awsAccounts || []

  const allCategories = [
    {
      id: 'servers' as const,
      num: 1,
      title: 'Servers Monitoring',
      subtitle: 'Infrastructure Nodes',
      icon: ServerIcon,
      count: safeServers.length,
      onlineCount: safeServers.filter((s) => s?.is_online).length
    },
    {
      id: 'websites' as const,
      num: 2,
      title: 'Website Monitoring',
      subtitle: 'HTTP Uptime Probes',
      icon: Globe,
      count: safeWebsites.length,
      onlineCount: safeWebsites.filter((w) => w?.latest_check?.status === 'Online').length
    },
    {
      id: 'databases' as const,
      num: 3,
      title: 'Database Monitoring',
      subtitle: 'PostgreSQL, Supabase & DBs',
      icon: DatabaseIcon,
      count: safeDatabases.length,
      onlineCount: safeDatabases.filter((d) => d?.latest_check?.status === 'Healthy').length
    },
    {
      id: 'github' as const,
      num: 4,
      title: 'GitHub Monitoring',
      subtitle: 'Repositories & CI/CD',
      icon: Github,
      count: safeGithubProjects.length,
      onlineCount: safeGithubProjects.length
    },
    {
      id: 'aws' as const,
      num: 5,
      title: 'AWS Cloud Monitoring',
      subtitle: 'EC2, EBS, SG & CloudWatch',
      icon: Cloud,
      count: safeAWSAccounts.length,
      onlineCount: safeAWSAccounts.length
    },
    {
      id: 'aws-costing' as const,
      num: 6,
      title: 'AWS Costing & Billing',
      subtitle: 'Cost Explorer & Budgets',
      icon: DollarSign,
      count: safeAWSAccounts.length,
      onlineCount: safeAWSAccounts.length
    },
    {
      id: 'telegram' as const,
      num: 7,
      title: 'Telegram Notifications',
      subtitle: 'Connect Bot, Alerts & Push',
      icon: Send,
      count: 0,
      onlineCount: 0
    },
    {
      id: 'iam' as const,
      num: 8,
      title: 'IAM & User Management',
      subtitle: 'Teams, Roles & Permissions',
      icon: ShieldCheck,
      count: 0,
      onlineCount: 0
    }
  ]

  // Filter tabs according to user permissions
  const categories = allCategories.filter((cat) => hasPermission(cat.id === 'aws-costing' ? 'aws_costing' : (cat.id as any), 'read'))

  const handleSelectService = (tabId: TabType) => {
    setActiveTab(tabId)
    if (tabId === 'servers') setSelectedServerId(null)
    if (tabId === 'websites') setSelectedWebsiteId(null)
    if (tabId === 'databases') setSelectedDatabaseId(null)
    if (tabId === 'github') setSelectedGithubProjectId(null)
    if (tabId === 'aws' || tabId === 'aws-costing') setSelectedAWSAccountId(null)
    if (closeMobile) closeMobile()
  }

  const handleAddClick = () => {
    if (activeTab === 'servers') {
      setJustCreatedCredentials(null)
      setIsAddModalOpen(true)
    } else if (activeTab === 'websites') {
      setIsAddWebsiteModalOpen(true)
    } else if (activeTab === 'databases') {
      setIsAddDatabaseModalOpen(true)
    } else if (activeTab === 'github') {
      setIsAddGithubModalOpen(true)
    } else if (activeTab === 'aws' || activeTab === 'aws-costing') {
      setIsAddAWSModalOpen(true)
    }
  }

  const currentTabWriteable = hasPermission((activeTab === 'aws-costing' ? 'aws_costing' : activeTab) as any, 'write')
  const roleName = user?.profile?.role_details?.name || (user?.profile?.is_superadmin || user?.is_staff ? 'Superadmin / Admin' : 'Viewer')

  return (
    <div className="flex flex-col h-full w-full justify-between font-sans overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight tracking-tight text-slate-900 dark:text-white">
              MonitorDep
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest">
              Monitoring Suite
            </span>
          </div>
        </div>

        {currentTabWriteable && activeTab !== 'iam' && activeTab !== 'telegram' && (
          <button
            onClick={handleAddClick}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
            title={`Add ${activeTab}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Items (Scrollable container) */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto min-h-0 border-b border-slate-100 dark:border-slate-850/50">
          <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase flex justify-between">
            <span>Monitoring & Control</span>
            <span className="font-mono">{categories.length} Accessible</span>
          </div>

          <nav className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeTab === cat.id

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectService(cat.id)}
                  className={`w-full p-3 rounded-2xl transition-all duration-200 text-left flex items-center justify-between group relative ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-md shadow-indigo-600/20 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono opacity-70">#{cat.num}</span>
                        <h2 className="text-xs font-bold truncate leading-snug">{cat.title}</h2>
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          isActive ? 'text-slate-200 dark:text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cat.id !== 'iam' && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'translate-x-0.5 text-white' : 'opacity-0 group-hover:opacity-100 text-slate-400'
                      }`}
                    />
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

      {/* Footer User Profile & Settings Section */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-850 space-y-3 bg-slate-50/50 dark:bg-slate-955 shrink-0">
        {/* User Profile Card */}
        {user && (
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-all group shadow-sm text-left"
            title="View User Profile & Permissions Scope"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md shadow-indigo-500/20">
                {(user.first_name?.[0] || user.username[0] || 'U').toUpperCase()}
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                </h4>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-semibold">
                    {roleName}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors shrink-0">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </button>
        )}

        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
          <span className="font-semibold text-[11px]">Auto-Refresh (30s)</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              autoRefresh ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-1.5 border-t border-slate-200 dark:border-slate-850/60 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="font-mono">v2.4.0 Engine</span>
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Backend Active
          </span>
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  )
}
