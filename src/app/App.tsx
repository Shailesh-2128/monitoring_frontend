import { useState, useEffect, useCallback, lazy, Suspense } from 'react'

// Context & Skeleton Loaders
import { ThemeProvider } from '../context/ThemeContext'
import { DetailsSkeleton } from '../components/common/SkeletonLoaders'

// Layout Components
import { Layout } from '../components/layout/Layout'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { ServiceOutletOverview } from '../components/layout/ServiceOutlet'

// Lazy Loaded Feature Details Components
const ServerDetails = lazy(() => import('../features/servers/components/ServerDetails').then(m => ({ default: m.ServerDetails })))
const WebsiteDetails = lazy(() => import('../features/website-monitor/components/WebsiteDetails').then(m => ({ default: m.WebsiteDetails })))
const DatabaseDetails = lazy(() => import('../features/databases/components/DatabaseDetails').then(m => ({ default: m.DatabaseDetails })))
const ProjectDetails = lazy(() => import('../features/github/components/ProjectDetails').then(m => ({ default: m.ProjectDetails })))
const AWSDetails = lazy(() => import('../features/aws/components/AWSDetails').then(m => ({ default: m.AWSDetails })))
const AWSCostingDetails = lazy(() => import('../features/aws-costing/components/AWSCostingDetails').then(m => ({ default: m.AWSCostingDetails })))
const TelegramSettings = lazy(() => import('../features/telegram/TelegramSettings').then(m => ({ default: m.TelegramSettings })))

// Modal Feature Components
import { AddServerModal } from '../features/servers/components/AddServerModal'
import { AddWebsiteModal } from '../features/website-monitor/components/AddWebsiteModal'
import { AddDatabaseModal } from '../features/databases/components/AddDatabaseModal'
import { AddProjectModal } from '../features/github/components/AddProjectModal'
import { EditProjectModal } from '../features/github/components/EditProjectModal'
import { AddAWSModal } from '../features/aws/components/AddAWSModal'
import { AddAWSBudgetModal } from '../features/aws-costing/components/AddAWSBudgetModal'
import { ImportBackupModal } from '../features/databases/components/ImportBackupModal'

// Types
import { Server, DetailedServer, MetricHistoryPoint } from '../types/server'
import { Website, WebsiteHistoryPoint } from '../types/website'
import { Database } from '../types/database'
import {
  GitHubProject,
  GitHubRepoDetails,
  Commit,
  PullRequestsSummary,
  IssuesSummary,
  WorkflowRunsSummary,
  ReleasesSummary
} from '../types/github'
import {
  AWSAccount,
  AWSTelemetryOverview,
  AWSBudget,
  AWSCostOverview,
  AWSDailyCostTrendPoint,
  AWSServiceCost,
  AWSRegionCost,
  AWSCostForecast,
  AWSCostRecommendation
} from '../types/aws'

// Auth & IAM Components
import { AuthProvider, useAuth } from '../context/AuthContext'
import { LoginPage } from '../features/iam/LoginPage'
import { UserManagement } from '../features/iam/UserManagement'
import { TabType } from '../components/layout/Sidebar'
import { ServerDocModal } from '../features/servers/components/ServerDocModal'

// Determine Backend URL
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

function App() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('servers')
  const [isServerDocOpen, setIsServerDocOpen] = useState(false)

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(url, { ...options, headers })
    if (res.status === 403) {
      const errData = await res.json().catch(() => ({}))
      const msg = errData.detail || errData.message || 'Permission Denied: You have Read-Only access mode for this module.'
      alert(msg)
      throw new Error(msg)
    }
    return res
  }, [token])

  // Servers lists states
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null)
  const [serverDetail, setServerDetail] = useState<DetailedServer | null>(null)
  const [history, setHistory] = useState<MetricHistoryPoint[]>([])
  const [timeRange, setTimeRange] = useState<string>('1h')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedAgentCmd, setCopiedAgentCmd] = useState(false)

  // Add Server Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addServerProject, setAddServerProject] = useState('King Wins')
  const [addServerName, setAddServerName] = useState('Production Server')
  const [addServerPublicIp, setAddServerPublicIp] = useState('')
  const [addServerPrivateIp, setAddServerPrivateIp] = useState('')
  const [addServerEnvironment, setAddServerEnvironment] = useState('Production')
  const [addServerOs, setAddServerOs] = useState('Ubuntu 24.04')
  
  // Registration Success Credentials
  const [justCreatedCredentials, setJustCreatedCredentials] = useState<{
    id: number
    token: string
    name: string
  } | null>(null)

  // Website Monitors states
  const [websites, setWebsites] = useState<Website[]>([])
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null)
  const [websiteDetail, setWebsiteDetail] = useState<Website | null>(null)
  const [websiteHistory, setWebsiteHistory] = useState<WebsiteHistoryPoint[]>([])
  const [websiteUptime, setWebsiteUptime] = useState<number>(100)
  const [websiteAvgResponseTime, setWebsiteAvgResponseTime] = useState<number>(0)
  const [, setLoadingWebsites] = useState(true)
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false)

  // Add Website Form States
  const [addWebProject, setAddWebProject] = useState('King Wins')
  const [addWebName, setAddWebName] = useState('King Wins API')
  const [addWebUrl, setAddWebUrl] = useState('https://api.kingwins.pro')
  const [addWebExpectedStatus, setAddWebExpectedStatus] = useState<number>(200)
  const [addWebCheckInterval, setAddWebCheckInterval] = useState<number>(60)

  // Database Monitors states
  const [databases, setDatabases] = useState<Database[]>([])
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(null)
  const [databaseDetail, setDatabaseDetail] = useState<Database | null>(null)
  const [databaseHistory, setDatabaseHistory] = useState<any[]>([])
  const [databaseUptime, setDatabaseUptime] = useState<number>(100)
  const [databaseAvgResponseTime, setDatabaseAvgResponseTime] = useState<number>(0)
  const [databaseCurrentSize, setDatabaseCurrentSize] = useState<number | null>(null)
  const [databaseCurrentConnections, setDatabaseCurrentConnections] = useState<number | null>(null)
  const [, setLoadingDatabases] = useState(true)
  const [isAddDatabaseModalOpen, setIsAddDatabaseModalOpen] = useState(false)
  const [isImportBackupModalOpen, setIsImportBackupModalOpen] = useState(false)
  const [importBackupDatabase, setImportBackupDatabase] = useState<Database | null>(null)

  // Add Database Form States
  const [addDbProject, setAddDbProject] = useState('King Wins')
  const [addDbName, setAddDbName] = useState('Production Supabase')
  const [addDbType, setAddDbType] = useState('Supabase')
  const [addDbHost, setAddDbHost] = useState('db.example.supabase.co')
  const [addDbPort, setAddDbPort] = useState<number>(5432)
  const [addDbDatabaseName, setAddDbDatabaseName] = useState('postgres')
  const [addDbUsername, setAddDbUsername] = useState('postgres')
  const [addDbPassword, setAddDbPassword] = useState('')
  const [addDbConnectionUri, setAddDbConnectionUri] = useState('')
  const [addDbProjectRef, setAddDbProjectRef] = useState('')
  const [addDbApiKey, setAddDbApiKey] = useState('')
  const [addDbCheckInterval, setAddDbCheckInterval] = useState<number>(60)

  // GitHub Projects Monitoring States
  const [githubProjects, setGithubProjects] = useState<GitHubProject[]>([])
  const [selectedGithubProjectId, setSelectedGithubProjectId] = useState<number | null>(null)
  const [selectedGithubProject, setSelectedGithubProject] = useState<GitHubProject | null>(null)
  const [repoDetails, setRepoDetails] = useState<GitHubRepoDetails | null>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequestsSummary | null>(null)
  const [issues, setIssues] = useState<IssuesSummary | null>(null)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRunsSummary | null>(null)
  const [releases, setReleases] = useState<ReleasesSummary | null>(null)
  const [, setLoadingGithubProjects] = useState(true)
  const [loadingGithubDetail, setLoadingGithubDetail] = useState(false)
  const [isAddGithubModalOpen, setIsAddGithubModalOpen] = useState(false)
  const [isEditGithubModalOpen, setIsEditGithubModalOpen] = useState(false)

  // AWS Cloud Monitoring States
  const [awsAccounts, setAwsAccounts] = useState<AWSAccount[]>([])
  const [selectedAWSAccountId, setSelectedAWSAccountId] = useState<number | null>(null)
  const [selectedAWSOverview, setSelectedAWSOverview] = useState<AWSTelemetryOverview | null>(null)
  const [isAddAWSModalOpen, setIsAddAWSModalOpen] = useState(false)
  const [, setLoadingAWS] = useState(true)
  const [loadingAWSDetail, setLoadingAWSDetail] = useState(false)

  // Fetch all AWS accounts list
  const fetchAWSAccounts = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    try {
      const res = await authFetch(`${API_BASE}/api/aws/accounts/`)
      if (res.ok) {
        const data = await res.json()
        setAwsAccounts(data)
      }
    } catch (err) {
      console.error("Failed to fetch AWS accounts:", err)
    } finally {
      setLoadingAWS(false)
      setIsRefreshing(false)
    }
  }, [authFetch])

  const fetchAWSAccountOverview = useCallback(async (id: number) => {
    setSelectedAWSOverview((prev) => {
      if (!prev) setLoadingAWSDetail(true)
      return prev
    })
    try {
      const res = await authFetch(`${API_BASE}/api/aws/accounts/${id}/overview/`)
      if (res.ok) {
        const data = await res.json()
        setSelectedAWSOverview(data)
      }
    } catch (err) {
      console.error("Failed to fetch AWS account overview:", err)
    } finally {
      setLoadingAWSDetail(false)
    }
  }, [authFetch])

  // AWS Costing States
  const [costOverview, setCostOverview] = useState<AWSCostOverview | null>(null)
  const [dailyTrend, setDailyTrend] = useState<AWSDailyCostTrendPoint[]>([])
  const [trendDays, setTrendDays] = useState<number>(30)
  const [serviceCosts, setServiceCosts] = useState<AWSServiceCost[]>([])
  const [regionCosts, setRegionCosts] = useState<AWSRegionCost[]>([])
  const [costForecast, setCostForecast] = useState<AWSCostForecast | null>(null)
  const [budgets, setBudgets] = useState<AWSBudget[]>([])
  const [recommendations, setRecommendations] = useState<AWSCostRecommendation[]>([])
  const [totalSavings, setTotalSavings] = useState<number>(0)
  const [loadingCosting, setLoadingCosting] = useState<boolean>(false)
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState<boolean>(false)

  const fetchAWSCostingData = useCallback(async (accountId?: number, days: number = trendDays) => {
    setLoadingCosting(true)
    const query = accountId ? `?account_id=${accountId}` : ''
    try {
      // 1. Overview
      const resOverview = await authFetch(`${API_BASE}/api/aws/costing/overview/${query}`)
      if (resOverview.ok) {
        const data = await resOverview.json()
        setCostOverview(data)
      }

      // 2. Daily Trend
      const trendQuery = accountId ? `?account_id=${accountId}&days=${days}` : `?days=${days}`
      const resTrend = await authFetch(`${API_BASE}/api/aws/costing/daily-trend/${trendQuery}`)
      if (resTrend.ok) {
        const data = await resTrend.json()
        setDailyTrend(data)
      }

      // 3. Service Costs
      const resService = await authFetch(`${API_BASE}/api/aws/costing/by-service/${query}`)
      if (resService.ok) {
        const data = await resService.json()
        setServiceCosts(data)
      }

      // 4. Region Costs
      const resRegion = await authFetch(`${API_BASE}/api/aws/costing/by-region/${query}`)
      if (resRegion.ok) {
        const data = await resRegion.json()
        setRegionCosts(data)
      }

      // 5. Forecast
      const resFc = await authFetch(`${API_BASE}/api/aws/costing/forecast/${query}`)
      if (resFc.ok) {
        const data = await resFc.json()
        setCostForecast(data)
      }

      // 6. Budgets
      const resBudgets = await authFetch(`${API_BASE}/api/aws/budgets/${query}`)
      if (resBudgets.ok) {
        const data = await resBudgets.json()
        setBudgets(data)
      }

      // 7. Recommendations
      const resRecs = await authFetch(`${API_BASE}/api/aws/costing/recommendations/${query}`)
      if (resRecs.ok) {
        const data = await resRecs.json()
        setRecommendations(data.recommendations || [])
        setTotalSavings(data.total_savings || 0)
      }
    } catch (err) {
      console.error("Failed to fetch AWS costing data:", err)
    } finally {
      setLoadingCosting(false)
    }
  }, [authFetch, trendDays])

  const handleSaveBudget = async (budgetData: {
    aws_account: number
    name: string
    monthly_budget: number
    currency: string
    email_alert?: string
    enabled: boolean
  }) => {
    const res = await authFetch(`${API_BASE}/api/aws/budgets/`, {
      method: 'POST',
      body: JSON.stringify(budgetData)
    })
    if (res.ok) {
      fetchAWSCostingData(selectedAWSAccountId || undefined)
    } else {
      throw new Error('Failed to create budget')
    }
  }

  const handleDeleteBudget = async (budgetId: number) => {
    const res = await authFetch(`${API_BASE}/api/aws/budgets/${budgetId}/`, { method: 'DELETE' })
    if (res.ok) {
      fetchAWSCostingData(selectedAWSAccountId || undefined)
    }
  }

  const handleExportReport = (params: {
    format: 'csv' | 'excel' | 'pdf'
    startDate?: string
    endDate?: string
    service?: string
    region?: string
  }) => {
    const queryParts: string[] = [`format=${params.format}`]
    if (selectedAWSAccountId) queryParts.push(`account_id=${selectedAWSAccountId}`)
    if (params.startDate) queryParts.push(`start_date=${params.startDate}`)
    if (params.endDate) queryParts.push(`end_date=${params.endDate}`)
    if (params.service) queryParts.push(`service=${params.service}`)
    if (params.region) queryParts.push(`region=${params.region}`)

    window.open(`${API_BASE}/api/aws/costing/export/?${queryParts.join('&')}`, '_blank')
  }

  const handleAddAWSAccountSubmit = async (data: { name: string; access_key: string; secret_key: string; region: string }) => {
    const payload = {
      account_name: data.name || 'Primary AWS Account',
      access_key_id: data.access_key,
      secret_access_key: data.secret_key,
      region: data.region || 'us-east-1',
      project: 'King Wins'
    }
    const res = await authFetch(`${API_BASE}/api/aws/accounts/`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const newAcc = await res.json()
      setAwsAccounts((prev) => [newAcc, ...prev])
      setSelectedAWSAccountId(newAcc.id)
      fetchAWSAccountOverview(newAcc.id)
    } else {
      const errData = await res.json().catch(() => ({}))
      const msg = typeof errData === 'object' ? Object.values(errData).flat().join(' ') : 'Failed to connect AWS Account.'
      throw new Error(msg || 'Failed to connect AWS Account.')
    }
  }

  const handleDeleteAWSAccount = async (id: number) => {
    if (!window.confirm("Are you sure you want to disconnect this AWS Cloud Account?")) return
    try {
      const res = await authFetch(`${API_BASE}/api/aws/accounts/${id}/`, { method: 'DELETE' })
      if (res.ok) {
        setAwsAccounts((prev) => prev.filter((a) => a.id !== id))
        setSelectedAWSAccountId(null)
        setSelectedAWSOverview(null)
      }
    } catch (err) {
      console.error("Failed to delete AWS account:", err)
    }
  }

  // Fetch all servers list
  const fetchServers = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    try {
      const res = await authFetch(`${API_BASE}/api/servers/`)
      if (res.ok) {
        const data = await res.json()
        setServers(data)
      }
    } catch (err) {
      console.error("Failed to fetch servers:", err)
    } finally {
      setLoadingList(false)
      setIsRefreshing(false)
    }
  }, [authFetch])

  // Fetch selected server details
  const fetchServerDetail = useCallback(async (id: number) => {
    setServerDetail((prev) => {
      if (!prev) setLoadingDetail(true)
      return prev
    })
    try {
      const res = await authFetch(`${API_BASE}/api/servers/${id}/`)
      if (res.ok) {
        const data = await res.json()
        setServerDetail(data)
      }
    } catch (err) {
      console.error("Failed to fetch server detail:", err)
    } finally {
      setLoadingDetail(false)
    }
  }, [authFetch])

  // Fetch selected server history
  const fetchServerHistory = useCallback(async (id: number, range: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/servers/${id}/metrics/?range=${range}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (err) {
      console.error("Failed to fetch server metrics history:", err)
    }
  }, [authFetch])

  const refreshActiveServer = useCallback((id: number, range: string) => {
    fetchServerDetail(id)
    fetchServerHistory(id, range)
  }, [fetchServerDetail, fetchServerHistory])

  // Fetch all websites list
  const fetchWebsites = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    try {
      const res = await authFetch(`${API_BASE}/api/websites/`)
      if (res.ok) {
        const data = await res.json()
        setWebsites(data)
      }
    } catch (err) {
      console.error("Failed to fetch websites:", err)
    } finally {
      setLoadingWebsites(false)
      setIsRefreshing(false)
    }
  }, [authFetch])

  const fetchWebsiteDetail = useCallback(async (id: number) => {
    setWebsiteDetail((prev) => {
      if (!prev) setLoadingDetail(true)
      return prev
    })
    try {
      const res = await authFetch(`${API_BASE}/api/websites/${id}/`)
      if (res.ok) {
        const data = await res.json()
        setWebsiteDetail(data)
      }
    } catch (err) {
      console.error("Failed to fetch website detail:", err)
    } finally {
      setLoadingDetail(false)
    }
  }, [authFetch])

  const fetchWebsiteHistory = useCallback(async (id: number, range: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/websites/${id}/metrics/?range=${range}`)
      if (res.ok) {
        const data = await res.json()
        setWebsiteHistory(data.history)
        setWebsiteUptime(data.uptime_percentage)
        setWebsiteAvgResponseTime(data.average_response_time)
      }
    } catch (err) {
      console.error("Failed to fetch website history:", err)
    }
  }, [authFetch])

  const refreshActiveWebsite = useCallback((id: number, range: string) => {
    fetchWebsiteDetail(id)
    fetchWebsiteHistory(id, range)
  }, [fetchWebsiteDetail, fetchWebsiteHistory])

  // Fetch all databases list
  const fetchDatabases = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/databases/`)
      if (res.ok) {
        const data = await res.json()
        setDatabases(data)
      }
    } catch (err) {
      console.error('Error fetching databases:', err)
    } finally {
      setLoadingDatabases(false)
    }
  }, [authFetch])

  const handleExportBackup = useCallback(async (db: Database) => {
    try {
      const res = await authFetch(`${API_BASE}/api/databases/${db.id}/export-backup/`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to export backup.')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${db.name.toLowerCase().replace(/\s+/g, '_')}_backup.sql`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      alert(err.message || 'Error exporting database backup.')
    }
  }, [authFetch])

  const handleOpenImportModal = useCallback((db: Database) => {
    setImportBackupDatabase(db)
    setIsImportBackupModalOpen(true)
  }, [])

  const fetchDatabaseDetail = useCallback(async (id: number) => {
    setDatabaseDetail((prev) => {
      if (!prev) setLoadingDetail(true)
      return prev
    })
    try {
      const res = await authFetch(`${API_BASE}/api/databases/${id}/`)
      if (res.ok) {
        const data = await res.json()
        setDatabaseDetail(data)
      }
    } catch (err) {
      console.error("Failed to fetch database detail:", err)
    } finally {
      setLoadingDetail(false)
    }
  }, [authFetch])

  const handleRunDatabaseCheck = useCallback(async (db: Database) => {
    try {
      const res = await authFetch(`${API_BASE}/api/databases/${db.id}/check/`, {
        method: 'POST'
      })
      if (res.ok) {
        fetchDatabases()
        fetchDatabaseDetail(db.id)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Database connection test failed.')
      }
    } catch (err: any) {
      alert(err.message || 'Error running database connection test.')
    }
  }, [authFetch, fetchDatabases, fetchDatabaseDetail])

  const handleUpdateCheckInterval = useCallback(async (db: Database, intervalSeconds: number) => {
    try {
      let res = await authFetch(`${API_BASE}/api/databases/${db.id}/update/`, {
        method: 'POST',
        body: JSON.stringify({ check_interval: intervalSeconds })
      })
      if (!res.ok) {
        res = await authFetch(`${API_BASE}/api/databases/${db.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ check_interval: intervalSeconds })
        })
      }
      if (res.ok) {
        fetchDatabases()
        fetchDatabaseDetail(db.id)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to update check interval.')
      }
    } catch (err: any) {
      alert(err.message || 'Error updating check interval.')
    }
  }, [authFetch, fetchDatabases, fetchDatabaseDetail])

  const handleUpdateCredentials = useCallback(async (db: Database, projectRef: string, apiKey: string) => {
    try {
      let res = await authFetch(`${API_BASE}/api/databases/${db.id}/update/`, {
        method: 'POST',
        body: JSON.stringify({ project_ref: projectRef, api_key: apiKey })
      })
      if (!res.ok) {
        res = await authFetch(`${API_BASE}/api/databases/${db.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ project_ref: projectRef, api_key: apiKey })
        })
      }
      if (res.ok) {
        await authFetch(`${API_BASE}/api/databases/${db.id}/check/`, { method: 'POST' })
        fetchDatabases()
        fetchDatabaseDetail(db.id)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to update API credentials.')
      }
    } catch (err: any) {
      alert(err.message || 'Error updating API credentials.')
    }
  }, [authFetch, fetchDatabases, fetchDatabaseDetail])

  const handleUpdateDatabaseTarget = useCallback(async (db: Database, updatedData: any) => {
    try {
      const res = await authFetch(`${API_BASE}/api/databases/${db.id}/update/`, {
        method: 'POST',
        body: JSON.stringify(updatedData)
      })
      if (res.ok) {
        await authFetch(`${API_BASE}/api/databases/${db.id}/check/`, { method: 'POST' })
        fetchDatabases()
        fetchDatabaseDetail(db.id)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to update database target URL.')
      }
    } catch (err: any) {
      alert(err.message || 'Error updating database target URL.')
    }
  }, [authFetch, fetchDatabases, fetchDatabaseDetail])

  const fetchDatabaseHistory = useCallback(async (id: number, range: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/databases/${id}/metrics/?range=${range}`)
      if (res.ok) {
        const data = await res.json()
        setDatabaseHistory(data.history)
        setDatabaseUptime(data.uptime_percentage)
        setDatabaseAvgResponseTime(data.average_response_time)
        setDatabaseCurrentSize(data.current_size_mb)
        setDatabaseCurrentConnections(data.current_connections)
      }
    } catch (err) {
      console.error("Failed to fetch database history:", err)
    }
  }, [authFetch])

  const refreshActiveDatabase = useCallback((id: number, range: string) => {
    fetchDatabaseDetail(id)
    fetchDatabaseHistory(id, range)
  }, [fetchDatabaseDetail, fetchDatabaseHistory])

  // GitHub Projects Fetching Routines
  const fetchGithubProjects = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    try {
      const res = await authFetch(`${API_BASE}/api/projects/`)
      if (res.ok) {
        const data = await res.json()
        setGithubProjects(data)
      }
    } catch (err) {
      console.error("Failed to fetch GitHub projects:", err)
    } finally {
      setLoadingGithubProjects(false)
      setIsRefreshing(false)
    }
  }, [authFetch])

  const fetchGithubProjectDetails = useCallback(async (id: number) => {
    setSelectedGithubProject((prev) => {
      if (!prev) setLoadingGithubDetail(true)
      return prev
    })
    try {
      const res = await authFetch(`${API_BASE}/api/projects/${id}/overview/`)
      if (res.ok) {
        const data = await res.json()
        setSelectedGithubProject(data.project)
        setRepoDetails(data.repository)
        setPullRequests(data.pull_requests)
        setIssues(data.issues)
        setWorkflowRuns(data.actions)
        setReleases(data.releases)
      }

      // Fetch full commit history
      const commitsRes = await authFetch(`${API_BASE}/api/projects/${id}/commits/`)
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json()
        if (Array.isArray(commitsData)) {
          if (commitsData.length > 0 && commitsData[0]?.error) {
            console.warn("GitHub commits error:", commitsData[0].error)
            setCommits([])
          } else {
            setCommits(commitsData)
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch GitHub project details:", err)
    } finally {
      setLoadingGithubDetail(false)
    }
  }, [authFetch])

  const handleAddGithubProject = async (data: {
    name: string
    github_owner: string
    github_repo: string
    default_branch: string
    github_token: string
  }) => {
    const res = await authFetch(`${API_BASE}/api/projects/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || errData.github_repo?.[0] || 'Failed to add GitHub project')
    }
    const newProj = await res.json()
    await fetchGithubProjects(true)
    setSelectedGithubProjectId(newProj.id)
  }

  const handleDeleteGithubProject = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this GitHub repository from monitoring?")) return
    try {
      const res = await authFetch(`${API_BASE}/api/projects/${id}/`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSelectedGithubProjectId(null)
        setSelectedGithubProject(null)
        setRepoDetails(null)
        setCommits([])
        setPullRequests(null)
        setIssues(null)
        setWorkflowRuns(null)
        setReleases(null)
        await fetchGithubProjects(true)
      } else {
        alert("Failed to delete GitHub project.")
      }
    } catch (err) {
      console.error("Error deleting GitHub project:", err)
    }
  }

  const handleEditGithubProjectSubmit = async (id: number, data: {
    name?: string
    github_owner?: string
    github_repo?: string
    default_branch?: string
    github_token?: string
  }) => {
    const res = await authFetch(`${API_BASE}/api/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || errData.github_repo?.[0] || 'Failed to update GitHub project')
    }
    await fetchGithubProjects(true)
    if (selectedGithubProjectId === id) {
      fetchGithubProjectDetails(id)
    }
  }

  // Initial loads on mount
  useEffect(() => {
    fetchServers(false)
    fetchWebsites(false)
    fetchDatabases(false)
    fetchGithubProjects(false)
    fetchAWSAccounts(false)
  }, [])

  // React to selecting server
  useEffect(() => {
    if (activeTab === 'servers') {
      if (selectedServerId !== null) {
        refreshActiveServer(selectedServerId, timeRange)
      } else {
        setServerDetail(null)
        setHistory([])
      }
    }
  }, [activeTab, selectedServerId, timeRange, refreshActiveServer])

  // React to selecting website
  useEffect(() => {
    if (activeTab === 'websites') {
      if (selectedWebsiteId !== null) {
        refreshActiveWebsite(selectedWebsiteId, timeRange)
      } else {
        setWebsiteDetail(null)
        setWebsiteHistory([])
      }
    }
  }, [activeTab, selectedWebsiteId, timeRange, refreshActiveWebsite])

  // React to selecting database
  useEffect(() => {
    if (activeTab === 'databases') {
      if (selectedDatabaseId !== null) {
        refreshActiveDatabase(selectedDatabaseId, timeRange)
      } else {
        setDatabaseDetail(null)
        setDatabaseHistory([])
      }
    }
  }, [activeTab, selectedDatabaseId, timeRange, refreshActiveDatabase])

  // React to selecting GitHub project
  useEffect(() => {
    if (activeTab === 'github') {
      if (selectedGithubProjectId !== null) {
        fetchGithubProjectDetails(selectedGithubProjectId)
      } else {
        setSelectedGithubProject(null)
        setRepoDetails(null)
        setCommits([])
        setPullRequests(null)
        setIssues(null)
        setWorkflowRuns(null)
        setReleases(null)
      }
    }
  }, [activeTab, selectedGithubProjectId, fetchGithubProjectDetails])

  // React to selecting AWS account
  useEffect(() => {
    if (activeTab === 'aws') {
      if (selectedAWSAccountId !== null) {
        fetchAWSAccountOverview(selectedAWSAccountId)
      } else {
        setSelectedAWSOverview(null)
      }
    }
  }, [activeTab, selectedAWSAccountId, fetchAWSAccountOverview])

  // React to selecting AWS Costing
  useEffect(() => {
    if (activeTab === 'aws-costing') {
      fetchAWSCostingData(selectedAWSAccountId || undefined)
    }
  }, [activeTab, selectedAWSAccountId, fetchAWSCostingData])

  // Polling loop (every 15s)
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      if (activeTab === 'servers') {
        fetchServers(false)
        if (selectedServerId !== null) {
          fetchServerDetail(selectedServerId)
          fetchServerHistory(selectedServerId, timeRange)
        }
      } else if (activeTab === 'websites') {
        fetchWebsites(false)
        if (selectedWebsiteId !== null) {
          fetchWebsiteDetail(selectedWebsiteId)
          fetchWebsiteHistory(selectedWebsiteId, timeRange)
        }
      } else if (activeTab === 'databases') {
        fetchDatabases(false)
        if (selectedDatabaseId !== null) {
          fetchDatabaseDetail(selectedDatabaseId)
          fetchDatabaseHistory(selectedDatabaseId, timeRange)
        }
      } else if (activeTab === 'github') {
        fetchGithubProjects(false)
        if (selectedGithubProjectId !== null) {
          fetchGithubProjectDetails(selectedGithubProjectId)
        }
      } else if (activeTab === 'aws') {
        fetchAWSAccounts(false)
        if (selectedAWSAccountId !== null) {
          fetchAWSAccountOverview(selectedAWSAccountId)
        }
      }
    }, 15000)
    return () => clearInterval(timer)
  }, [
    autoRefresh,
    activeTab,
    selectedServerId,
    selectedWebsiteId,
    selectedDatabaseId,
    selectedGithubProjectId,
    selectedAWSAccountId,
    timeRange,
    fetchServers,
    fetchServerDetail,
    fetchServerHistory,
    fetchWebsites,
    fetchWebsiteDetail,
    fetchWebsiteHistory,
    fetchDatabases,
    fetchDatabaseDetail,
    fetchDatabaseHistory,
    fetchGithubProjects,
    fetchGithubProjectDetails
  ])

  // Filter servers list
  const filteredServers = servers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.hostname && s.hostname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter websites list
  const filteredWebsites = websites.filter(w => {
    const q = searchQuery.toLowerCase()
    return (
      (w.name || '').toLowerCase().includes(q) ||
      (w.url || '').toLowerCase().includes(q) ||
      (w.project || '').toLowerCase().includes(q)
    )
  })

  // Filter databases list
  const filteredDatabases = databases.filter(db => {
    const q = searchQuery.toLowerCase()
    return (
      (db.name || '').toLowerCase().includes(q) ||
      (db.db_type || '').toLowerCase().includes(q) ||
      (db.project || '').toLowerCase().includes(q) ||
      (db.host || '').toLowerCase().includes(q)
    )
  })

  // Filter github projects list
  const filteredGithubProjects = githubProjects.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.github_owner || '').toLowerCase().includes(q) ||
      (p.github_repo || '').toLowerCase().includes(q)
    )
  })

  // Filter AWS accounts list
  const filteredAWSAccounts = awsAccounts.filter(acc => {
    const q = searchQuery.toLowerCase()
    const accName = acc.account_name || acc.name || ''
    const region = acc.region || ''
    const keyMasked = acc.access_key_masked || ''
    return (
      accName.toLowerCase().includes(q) ||
      region.toLowerCase().includes(q) ||
      keyMasked.toLowerCase().includes(q)
    )
  })

  const activeGithubProject = githubProjects.find(p => p.id === selectedGithubProjectId) || selectedGithubProject

  const handleAddServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        project_name: addServerProject,
        name: addServerName,
        public_ip: addServerPublicIp,
        private_ip: addServerPrivateIp,
        environment: addServerEnvironment,
        os: addServerOs
      }
      
      const res = await authFetch(`${API_BASE}/api/servers/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setJustCreatedCredentials({
          id: data.server_id,
          token: data.token,
          name: addServerName
        })
        
        await fetchServers(false)
        setSelectedServerId(data.server_id)
        
        setAddServerProject('King Wins')
        setAddServerName('Production Server')
        setAddServerPublicIp('')
        setAddServerPrivateIp('')
        setAddServerEnvironment('Production')
        setAddServerOs('Ubuntu 24.04')
      }
    } catch (err: any) {
      console.error("Error creating server:", err)
    }
  }

  const handleDeleteServer = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this server node and all its telemetry history? This action cannot be undone.")) {
      return
    }
    
    try {
      const res = await authFetch(`${API_BASE}/api/servers/${id}/`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSelectedServerId(null)
        setServerDetail(null)
        setHistory([])
        await fetchServers(true)
      }
    } catch (err: any) {
      console.error("Error deleting server:", err)
    }
  }

  const handleAddWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        project: addWebProject,
        name: addWebName,
        url: addWebUrl,
        expected_status_code: addWebExpectedStatus,
        check_interval_seconds: addWebCheckInterval
      }

      const res = await authFetch(`${API_BASE}/api/websites/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setIsAddWebsiteModalOpen(false)
        await fetchWebsites(true)
        setSelectedWebsiteId(data.id)
      }
    } catch (err: any) {
      console.error("Error creating website:", err)
    }
  }

  const handleDeleteWebsite = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this website monitor?")) return
    try {
      const res = await authFetch(`${API_BASE}/api/websites/${id}/`, { method: 'DELETE' })
      if (res.ok) {
        setSelectedWebsiteId(null)
        setWebsiteDetail(null)
        setWebsiteHistory([])
        await fetchWebsites(true)
      }
    } catch (err: any) {
      console.error("Error deleting website:", err)
    }
  }

  const handleAddDatabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        project: addDbProject,
        name: addDbName,
        db_type: addDbType,
        host: addDbHost,
        port: addDbPort,
        database_name: addDbDatabaseName,
        username: addDbUsername,
        password: addDbPassword,
        connection_uri: addDbConnectionUri,
        project_ref: addDbProjectRef,
        api_key: addDbApiKey,
        check_interval: addDbCheckInterval
      }

      const res = await authFetch(`${API_BASE}/api/databases/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setIsAddDatabaseModalOpen(false)
        await fetchDatabases(true)
        setSelectedDatabaseId(data.id)
      }
    } catch (err: any) {
      console.error("Error creating database target:", err)
    }
  }

  const handleDeleteDatabase = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this database target?")) return
    try {
      const res = await authFetch(`${API_BASE}/api/databases/${id}/`, { method: 'DELETE' })
      if (res.ok) {
        setSelectedDatabaseId(null)
        setDatabaseDetail(null)
        setDatabaseHistory([])
        await fetchDatabases(true)
      }
    } catch (err: any) {
      console.error("Error deleting database target:", err)
    }
  }

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <>
      <Layout
        sidebar={
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            servers={servers}
            websites={websites}
            databases={databases}
            githubProjects={githubProjects}
            awsAccounts={awsAccounts}
            setSelectedServerId={setSelectedServerId}
            setSelectedWebsiteId={setSelectedWebsiteId}
            setSelectedDatabaseId={setSelectedDatabaseId}
            setSelectedGithubProjectId={setSelectedGithubProjectId}
            setSelectedAWSAccountId={setSelectedAWSAccountId}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            setIsAddModalOpen={setIsAddModalOpen}
            setIsAddWebsiteModalOpen={setIsAddWebsiteModalOpen}
            setIsAddDatabaseModalOpen={setIsAddDatabaseModalOpen}
            setIsAddGithubModalOpen={setIsAddGithubModalOpen}
            setIsAddAWSModalOpen={setIsAddAWSModalOpen}
            setJustCreatedCredentials={setJustCreatedCredentials}
          />
        }
        header={
          <Header
            activeTab={activeTab}
            activeServer={serverDetail}
            activeWebsite={websiteDetail}
            activeDatabase={databaseDetail}
            selectedServerId={selectedServerId}
            selectedWebsiteId={selectedWebsiteId}
            selectedDatabaseId={selectedDatabaseId}
            selectedGithubProjectId={selectedGithubProjectId}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            isRefreshing={isRefreshing}
            loadingDetail={loadingDetail}
            refreshActiveServer={refreshActiveServer}
            refreshActiveWebsite={refreshActiveWebsite}
            refreshActiveDatabase={refreshActiveDatabase}
            refreshActiveGithubProject={(id) => fetchGithubProjectDetails(id)}
            handleDeleteServer={handleDeleteServer}
            handleDeleteWebsite={handleDeleteWebsite}
            handleDeleteDatabase={handleDeleteDatabase}
            handleDeleteGithubProject={handleDeleteGithubProject}
            onOpenServerDocs={() => setIsServerDocOpen(true)}
            onBackToOverview={() => {
              setSelectedServerId(null)
              setSelectedWebsiteId(null)
              setSelectedDatabaseId(null)
              setSelectedGithubProjectId(null)
              setSelectedAWSAccountId(null)
            }}
          />
        }
      >
        <Suspense fallback={<DetailsSkeleton />}>
          {activeTab === 'iam' ? (
            <UserManagement />
          ) : activeTab === 'telegram' ? (
            <TelegramSettings apiBase={API_BASE} authFetch={authFetch} />
          ) : activeTab === 'aws-costing' ? (
            <AWSCostingDetails
              awsAccounts={awsAccounts}
              selectedAccountId={selectedAWSAccountId}
              onSelectAccount={(id) => {
                setSelectedAWSAccountId(id)
                fetchAWSCostingData(id)
              }}
              onAddAccount={() => setIsAddAWSModalOpen(true)}
              overview={costOverview}
              dailyTrend={dailyTrend}
              trendDays={trendDays}
              onChangeTrendDays={(days) => {
                setTrendDays(days)
                fetchAWSCostingData(selectedAWSAccountId || undefined, days)
              }}
              serviceCosts={serviceCosts}
              regionCosts={regionCosts}
              costForecast={costForecast}
              budgets={budgets}
              recommendations={recommendations}
              totalSavings={totalSavings}
              loading={loadingCosting}
              onRefresh={() => fetchAWSCostingData(selectedAWSAccountId || undefined)}
              onOpenAddBudgetModal={() => setIsAddBudgetModalOpen(true)}
              onDeleteBudget={handleDeleteBudget}
              onDeleteAccount={handleDeleteAWSAccount}
              onExportReport={handleExportReport}
            />
          ) : activeTab === 'aws' ? (
            selectedAWSAccountId === null ? (
              <ServiceOutletOverview
                activeTab="aws"
                servers={servers}
                filteredServers={filteredServers}
                websites={websites}
                filteredWebsites={filteredWebsites}
                databases={databases}
                filteredDatabases={filteredDatabases}
                githubProjects={githubProjects}
                filteredGithubProjects={filteredGithubProjects}
                awsAccounts={awsAccounts}
                filteredAWSAccounts={filteredAWSAccounts}
                selectedServerId={selectedServerId}
                selectedWebsiteId={selectedWebsiteId}
                selectedDatabaseId={selectedDatabaseId}
                selectedGithubProjectId={selectedGithubProjectId}
                selectedAWSAccountId={selectedAWSAccountId}
                setSelectedServerId={setSelectedServerId}
                setSelectedWebsiteId={setSelectedWebsiteId}
                setSelectedDatabaseId={setSelectedDatabaseId}
                setSelectedGithubProjectId={setSelectedGithubProjectId}
                setSelectedAWSAccountId={setSelectedAWSAccountId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddServer={() => setIsAddModalOpen(true)}
                onAddWebsite={() => setIsAddWebsiteModalOpen(true)}
                onAddDatabase={() => setIsAddDatabaseModalOpen(true)}
                onAddGithub={() => setIsAddGithubModalOpen(true)}
                onAddAWS={() => setIsAddAWSModalOpen(true)}
              />
            ) : loadingAWSDetail && !selectedAWSOverview ? (
              <DetailsSkeleton />
            ) : selectedAWSOverview ? (
              <AWSDetails
                awsOverview={selectedAWSOverview}
                loading={loadingAWSDetail}
                onRefresh={() => {
                  if (selectedAWSAccountId) {
                    fetchAWSAccountOverview(selectedAWSAccountId)
                  }
                }}
                onDelete={() => {
                  if (selectedAWSAccountId) {
                    handleDeleteAWSAccount(selectedAWSAccountId)
                  }
                }}
              />
            ) : (
              <DetailsSkeleton />
            )
          ) : activeTab === 'github' ? (
            selectedGithubProjectId === null ? (
              <ServiceOutletOverview
                activeTab="github"
                servers={servers}
                filteredServers={filteredServers}
                websites={websites}
                filteredWebsites={filteredWebsites}
                databases={databases}
                filteredDatabases={filteredDatabases}
                githubProjects={githubProjects}
                filteredGithubProjects={filteredGithubProjects}
                awsAccounts={awsAccounts}
                filteredAWSAccounts={filteredAWSAccounts}
                selectedServerId={selectedServerId}
                selectedWebsiteId={selectedWebsiteId}
                selectedDatabaseId={selectedDatabaseId}
                selectedGithubProjectId={selectedGithubProjectId}
                selectedAWSAccountId={selectedAWSAccountId}
                setSelectedServerId={setSelectedServerId}
                setSelectedWebsiteId={setSelectedWebsiteId}
                setSelectedDatabaseId={setSelectedDatabaseId}
                setSelectedGithubProjectId={setSelectedGithubProjectId}
                setSelectedAWSAccountId={setSelectedAWSAccountId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddServer={() => setIsAddModalOpen(true)}
                onAddWebsite={() => setIsAddWebsiteModalOpen(true)}
                onAddDatabase={() => setIsAddDatabaseModalOpen(true)}
                onAddGithub={() => setIsAddGithubModalOpen(true)}
                onAddAWS={() => setIsAddAWSModalOpen(true)}
              />
            ) : loadingGithubDetail && !activeGithubProject ? (
              <DetailsSkeleton />
            ) : activeGithubProject ? (
              <ProjectDetails
                project={activeGithubProject}
                repoDetails={repoDetails}
                commits={commits}
                pullRequests={pullRequests}
                issues={issues}
                workflowRuns={workflowRuns}
                releases={releases}
                loading={loadingGithubDetail}
                onRefresh={() => {
                  if (selectedGithubProjectId) {
                    fetchGithubProjectDetails(selectedGithubProjectId)
                  }
                }}
                onDelete={() => {
                  if (selectedGithubProjectId) {
                    handleDeleteGithubProject(selectedGithubProjectId)
                  }
                }}
                onEdit={() => setIsEditGithubModalOpen(true)}
              />
            ) : (
              <DetailsSkeleton />
            )
          ) : activeTab === 'databases' ? (
            selectedDatabaseId === null ? (
              <ServiceOutletOverview
                activeTab="databases"
                servers={servers}
                filteredServers={filteredServers}
                websites={websites}
                filteredWebsites={filteredWebsites}
                databases={databases}
                filteredDatabases={filteredDatabases}
                githubProjects={githubProjects}
                filteredGithubProjects={filteredGithubProjects}
                awsAccounts={awsAccounts}
                filteredAWSAccounts={filteredAWSAccounts}
                selectedServerId={selectedServerId}
                selectedWebsiteId={selectedWebsiteId}
                selectedDatabaseId={selectedDatabaseId}
                selectedGithubProjectId={selectedGithubProjectId}
                selectedAWSAccountId={selectedAWSAccountId}
                setSelectedServerId={setSelectedServerId}
                setSelectedWebsiteId={setSelectedWebsiteId}
                setSelectedDatabaseId={setSelectedDatabaseId}
                setSelectedGithubProjectId={setSelectedGithubProjectId}
                setSelectedAWSAccountId={setSelectedAWSAccountId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddServer={() => setIsAddModalOpen(true)}
                onAddWebsite={() => setIsAddWebsiteModalOpen(true)}
                onAddDatabase={() => setIsAddDatabaseModalOpen(true)}
                onAddGithub={() => setIsAddGithubModalOpen(true)}
                onAddAWS={() => setIsAddAWSModalOpen(true)}
                onExportBackup={handleExportBackup}
                onImportBackup={handleOpenImportModal}
              />
            ) : loadingDetail && !databaseDetail ? (
              <DetailsSkeleton />
            ) : databaseDetail ? (
              <DatabaseDetails
                databaseDetail={databaseDetail}
                history={databaseHistory}
                uptimePercentage={databaseUptime}
                averageResponseTime={databaseAvgResponseTime}
                currentSize={databaseCurrentSize}
                currentConnections={databaseCurrentConnections}
                onExportBackup={handleExportBackup}
                onImportBackup={handleOpenImportModal}
                onRunCheck={handleRunDatabaseCheck}
                onUpdateInterval={handleUpdateCheckInterval}
                onUpdateCredentials={handleUpdateCredentials}
                onUpdateTarget={handleUpdateDatabaseTarget}
              />
            ) : (
              <DetailsSkeleton />
            )
          ) : activeTab === 'websites' ? (
            selectedWebsiteId === null ? (
              <ServiceOutletOverview
                activeTab="websites"
                servers={servers}
                filteredServers={filteredServers}
                websites={websites}
                filteredWebsites={filteredWebsites}
                databases={databases}
                filteredDatabases={filteredDatabases}
                githubProjects={githubProjects}
                filteredGithubProjects={filteredGithubProjects}
                awsAccounts={awsAccounts}
                filteredAWSAccounts={filteredAWSAccounts}
                selectedServerId={selectedServerId}
                selectedWebsiteId={selectedWebsiteId}
                selectedDatabaseId={selectedDatabaseId}
                selectedGithubProjectId={selectedGithubProjectId}
                selectedAWSAccountId={selectedAWSAccountId}
                setSelectedServerId={setSelectedServerId}
                setSelectedWebsiteId={setSelectedWebsiteId}
                setSelectedDatabaseId={setSelectedDatabaseId}
                setSelectedGithubProjectId={setSelectedGithubProjectId}
                setSelectedAWSAccountId={setSelectedAWSAccountId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddServer={() => setIsAddModalOpen(true)}
                onAddWebsite={() => setIsAddWebsiteModalOpen(true)}
                onAddDatabase={() => setIsAddDatabaseModalOpen(true)}
                onAddGithub={() => setIsAddGithubModalOpen(true)}
                onAddAWS={() => setIsAddAWSModalOpen(true)}
              />
            ) : loadingDetail && !websiteDetail ? (
              <DetailsSkeleton />
            ) : websiteDetail ? (
              <WebsiteDetails
                websiteDetail={websiteDetail}
                history={websiteHistory}
                uptimePercentage={websiteUptime}
                averageResponseTime={websiteAvgResponseTime}
              />
            ) : (
              <DetailsSkeleton />
            )
          ) : (
            selectedServerId === null ? (
              <ServiceOutletOverview
                activeTab="servers"
                servers={servers}
                filteredServers={filteredServers}
                websites={websites}
                filteredWebsites={filteredWebsites}
                databases={databases}
                filteredDatabases={filteredDatabases}
                githubProjects={githubProjects}
                filteredGithubProjects={filteredGithubProjects}
                awsAccounts={awsAccounts}
                filteredAWSAccounts={filteredAWSAccounts}
                selectedServerId={selectedServerId}
                selectedWebsiteId={selectedWebsiteId}
                selectedDatabaseId={selectedDatabaseId}
                selectedGithubProjectId={selectedGithubProjectId}
                selectedAWSAccountId={selectedAWSAccountId}
                setSelectedServerId={setSelectedServerId}
                setSelectedWebsiteId={setSelectedWebsiteId}
                setSelectedDatabaseId={setSelectedDatabaseId}
                setSelectedGithubProjectId={setSelectedGithubProjectId}
                setSelectedAWSAccountId={setSelectedAWSAccountId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddServer={() => setIsAddModalOpen(true)}
                onAddWebsite={() => setIsAddWebsiteModalOpen(true)}
                onAddDatabase={() => setIsAddDatabaseModalOpen(true)}
                onAddGithub={() => setIsAddGithubModalOpen(true)}
                onAddAWS={() => setIsAddAWSModalOpen(true)}
                onOpenServerDocs={() => setIsServerDocOpen(true)}
              />
            ) : loadingDetail && !serverDetail ? (
              <DetailsSkeleton />
            ) : serverDetail ? (
              <ServerDetails
                serverDetail={serverDetail}
                history={history}
                copiedToken={copiedToken}
                setCopiedToken={setCopiedToken}
                copyToClipboard={copyToClipboard}
              />
            ) : (
              <DetailsSkeleton />
            )
          )}
        </Suspense>
      </Layout>

      {/* Add Server Modal */}
      <AddServerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddServerSubmit}
        addServerProject={addServerProject}
        setAddServerProject={setAddServerProject}
        addServerName={addServerName}
        setAddServerName={setAddServerName}
        addServerPublicIp={addServerPublicIp}
        setAddServerPublicIp={setAddServerPublicIp}
        addServerPrivateIp={addServerPrivateIp}
        setAddServerPrivateIp={setAddServerPrivateIp}
        addServerEnvironment={addServerEnvironment}
        setAddServerEnvironment={setAddServerEnvironment}
        addServerOs={addServerOs}
        setAddServerOs={setAddServerOs}
        justCreatedCredentials={justCreatedCredentials}
        copiedId={copiedId}
        copiedToken={copiedToken}
        copiedAgentCmd={copiedAgentCmd}
        copyToClipboard={copyToClipboard}
        setCopiedId={setCopiedId}
        setCopiedToken={setCopiedToken}
        setCopiedAgentCmd={setCopiedAgentCmd}
        API_BASE={API_BASE}
      />

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isAddWebsiteModalOpen}
        onClose={() => setIsAddWebsiteModalOpen(false)}
        onSubmit={handleAddWebsiteSubmit}
        addWebProject={addWebProject}
        setAddWebProject={setAddWebProject}
        addWebName={addWebName}
        setAddWebName={setAddWebName}
        addWebUrl={addWebUrl}
        setAddWebUrl={setAddWebUrl}
        addWebExpectedStatus={addWebExpectedStatus}
        setAddWebExpectedStatus={setAddWebExpectedStatus}
        addWebInterval={addWebCheckInterval}
        setAddWebInterval={setAddWebCheckInterval}
      />

      {/* Add Database Modal */}
      <AddDatabaseModal
        isOpen={isAddDatabaseModalOpen}
        onClose={() => setIsAddDatabaseModalOpen(false)}
        onSubmit={handleAddDatabaseSubmit}
        addDbProject={addDbProject}
        setAddDbProject={setAddDbProject}
        addDbName={addDbName}
        setAddDbName={setAddDbName}
        addDbType={addDbType}
        setAddDbType={setAddDbType}
        addDbHost={addDbHost}
        setAddDbHost={setAddDbHost}
        addDbPort={addDbPort}
        setAddDbPort={setAddDbPort}
        addDbDatabaseName={addDbDatabaseName}
        setAddDbDatabaseName={setAddDbDatabaseName}
        addDbUsername={addDbUsername}
        setAddDbUsername={setAddDbUsername}
        addDbPassword={addDbPassword}
        setAddDbPassword={setAddDbPassword}
        addDbConnectionUri={addDbConnectionUri}
        setAddDbConnectionUri={setAddDbConnectionUri}
        addDbProjectRef={addDbProjectRef}
        setAddDbProjectRef={setAddDbProjectRef}
        addDbApiKey={addDbApiKey}
        setAddDbApiKey={setAddDbApiKey}
        addDbCheckInterval={addDbCheckInterval}
        setAddDbCheckInterval={setAddDbCheckInterval}
      />

      {/* Add GitHub Project Modal */}
      <AddProjectModal
        isOpen={isAddGithubModalOpen}
        onClose={() => setIsAddGithubModalOpen(false)}
        onAddProject={handleAddGithubProject}
      />

      {/* Edit GitHub Project Modal */}
      <EditProjectModal
        isOpen={isEditGithubModalOpen}
        project={activeGithubProject}
        onClose={() => setIsEditGithubModalOpen(false)}
        onUpdateProject={handleEditGithubProjectSubmit}
      />

      {/* Add AWS Account Modal */}
      <AddAWSModal
        isOpen={isAddAWSModalOpen}
        onClose={() => setIsAddAWSModalOpen(false)}
        onSubmit={handleAddAWSAccountSubmit}
      />

      {/* Add AWS Budget Modal */}
      <AddAWSBudgetModal
        isOpen={isAddBudgetModalOpen}
        onClose={() => setIsAddBudgetModalOpen(false)}
        awsAccounts={awsAccounts}
        selectedAccountId={selectedAWSAccountId}
        onSaveBudget={handleSaveBudget}
      />

      {/* Server Agent Documentation Modal */}
      <ServerDocModal
        isOpen={isServerDocOpen}
        onClose={() => setIsServerDocOpen(false)}
        API_BASE={API_BASE}
      />

      {/* Database Backup Import Modal */}
      <ImportBackupModal
        isOpen={isImportBackupModalOpen}
        onClose={() => setIsImportBackupModalOpen(false)}
        database={importBackupDatabase}
        apiBase={API_BASE}
        token={token}
        onImportSuccess={fetchDatabases}
      />
    </>
  )
}

function MainContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [hasVisited, setHasVisited] = useState<boolean>(() => {
    return localStorage.getItem('deployops_has_visited') === 'true'
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      localStorage.setItem('deployops_has_visited', 'true')
      setHasVisited(true)
    }
  }, [isLoading, isAuthenticated])

  // Show full screen loader only when visiting for the FIRST TIME
  if (isLoading && !hasVisited) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-indigo-500/20" />
        <span className="text-sm font-semibold tracking-wider uppercase text-slate-300">
          Loading Infrastructure Suite...
        </span>
      </div>
    )
  }

  if (!isAuthenticated && !isLoading) {
    return <LoginPage />
  }

  return <App />
}

export default function RootApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

