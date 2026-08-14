import React, { useState, useEffect, useCallback } from 'react'
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Bot,
  Zap,
  GitPullRequest,
  Server as ServerIcon,
  Shield,
  Loader2,
  X,
  LogOut,
  Sliders,
  Terminal,
  History,
  Check
} from 'lucide-react'

interface TelegramSettingsProps {
  apiBase: string
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
}

interface ConnectionStatus {
  is_connected: boolean
  is_verified: boolean
  chat_id?: string
  telegram_username?: string
  first_name?: string
  last_name?: string
  connected_at?: string
  verification_token?: string
  notifications_enabled?: boolean
  bot_configured?: boolean
  bot_username?: string
}

interface TelegramConfig {
  id?: number
  bot_token: string
  bot_username: string
  webhook_secret: string
  cpu_threshold: number
  ram_threshold: number
  disk_threshold: number
  notify_server_overload: boolean
  notify_github_push: boolean
}

interface NotificationLog {
  id: number
  chat_id: string
  notification_type: string
  title: string
  message: string
  status: string
  error_message: string
  created_at: string
}

export const TelegramSettings: React.FC<TelegramSettingsProps> = ({ apiBase, authFetch }) => {
  const [statusLoading, setStatusLoading] = useState(true)
  const [connStatus, setConnStatus] = useState<ConnectionStatus | null>(null)
  
  // Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [connectLink, setConnectLink] = useState<string>('')
  const [verifying, setVerifying] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  // Config State
  const [config, setConfig] = useState<TelegramConfig>({
    bot_token: '',
    bot_username: '',
    webhook_secret: '',
    cpu_threshold: 80,
    ram_threshold: 85,
    disk_threshold: 90,
    notify_server_overload: true,
    notify_github_push: true
  })
  const [configSaving, setConfigSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Fetch connection status
  const fetchConnectionStatus = useCallback(async () => {
    try {
      const res = await authFetch(`${apiBase}/api/telegram/status/`)
      if (res.ok) {
        const data: ConnectionStatus = await res.json()
        setConnStatus(data)
        return data
      }
    } catch (err) {
      console.error("Failed to fetch Telegram connection status:", err)
    } finally {
      setStatusLoading(false)
    }
    return null
  }, [apiBase, authFetch])

  // Fetch config settings
  const fetchConfig = useCallback(async () => {
    try {
      const res = await authFetch(`${apiBase}/api/telegram/settings/`)
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (err) {
      console.error("Failed to fetch Telegram config:", err)
    }
  }, [apiBase, authFetch])

  // Fetch notification logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const res = await authFetch(`${apiBase}/api/telegram/logs/`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    } finally {
      setLogsLoading(false)
    }
  }, [apiBase, authFetch])

  useEffect(() => {
    fetchConnectionStatus()
    fetchConfig()
    fetchLogs()
  }, [fetchConnectionStatus, fetchConfig, fetchLogs])

  // Polling connection status when modal is open
  useEffect(() => {
    let interval: any = null
    if (isConnectModalOpen && (!connStatus || !connStatus.is_verified)) {
      setVerifying(true)
      interval = setInterval(async () => {
        const updated = await fetchConnectionStatus()
        if (updated && updated.is_verified) {
          setIsConnectModalOpen(false)
          setVerifying(false)
          setAlertMessage({
            type: 'success',
            text: 'Telegram Account linked successfully!'
          })
          fetchLogs()
        }
      }, 2500)
    } else {
      setVerifying(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isConnectModalOpen, connStatus, fetchConnectionStatus, fetchLogs])

  // Handle Connect Click
  const handleConnectClick = async () => {
    setActionLoading('connect')
    setAlertMessage(null)
    try {
      const res = await authFetch(`${apiBase}/api/telegram/generate-token/`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        setConnectLink(data.connect_link)
        setIsConnectModalOpen(true)
      } else {
        const err = await res.json()
        setAlertMessage({
          type: 'error',
          text: err.error || 'Failed to generate connection link.'
        })
      }
    } catch (err: any) {
      setAlertMessage({
        type: 'error',
        text: err.message || 'Network error generating connect link.'
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your Telegram account?")) return
    setActionLoading('disconnect')
    try {
      const res = await authFetch(`${apiBase}/api/telegram/disconnect/`, {
        method: 'POST'
      })
      if (res.ok) {
        setConnStatus((prev) => (prev ? { ...prev, is_connected: false, is_verified: false, chat_id: '', telegram_username: '' } : null))
        setAlertMessage({
          type: 'success',
          text: 'Telegram account disconnected.'
        })
        fetchLogs()
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Failed to disconnect.' })
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Save Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfigSaving(true)
    setAlertMessage(null)
    try {
      const res = await authFetch(`${apiBase}/api/telegram/settings/`, {
        method: 'POST',
        body: JSON.stringify(config)
      })
      if (res.ok) {
        const updated = await res.json()
        setConfig(updated)
        setAlertMessage({ type: 'success', text: 'Telegram Bot Configuration updated successfully!' })
        fetchConnectionStatus()
      } else {
        const err = await res.json()
        setAlertMessage({ type: 'error', text: err.detail || 'Failed to save config.' })
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Failed to save settings.' })
    } finally {
      setConfigSaving(false)
    }
  }

  // Handle Test Actions
  const handleSendTestNotification = async () => {
    setActionLoading('test-send')
    setAlertMessage(null)
    try {
      const res = await authFetch(`${apiBase}/api/telegram/test-send/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setAlertMessage({ type: 'success', text: data.message })
        fetchLogs()
      } else {
        setAlertMessage({ type: 'error', text: data.error || 'Failed to send test notification.' })
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Error triggering test.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleTestOverloadAlert = async () => {
    setActionLoading('test-overload')
    setAlertMessage(null)
    try {
      const res = await authFetch(`${apiBase}/api/telegram/test-overload/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setAlertMessage({ type: 'success', text: data.message })
        fetchLogs()
      } else {
        setAlertMessage({ type: 'error', text: data.error || 'Failed to test overload alert.' })
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Error testing overload alert.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleTestGithubPush = async () => {
    setActionLoading('test-push')
    setAlertMessage(null)
    try {
      const res = await authFetch(`${apiBase}/api/telegram/test-push/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setAlertMessage({ type: 'success', text: data.message })
        fetchLogs()
      } else {
        setAlertMessage({ type: 'error', text: data.error || 'Failed to test push alert.' })
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Error testing push alert.' })
    } finally {
      setActionLoading(null)
    }
  }

  const webhookUrl = `${apiBase}/api/github/webhook/`

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Header Banner (Telegram Theme Light Blue & White) */}
      <div className="bg-gradient-to-r from-[#24A1DE] to-[#0088cc] rounded-3xl p-6 shadow-lg shadow-sky-500/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#24A1DE] flex items-center justify-center shadow-md shrink-0">
            <Send className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Telegram Notifications & Alerts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white/20 text-white border border-white/30 backdrop-blur-md">
                Live Webhooks
              </span>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              Connect your Telegram account to receive instant Server Overload warnings and GitHub push updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => {
              fetchConnectionStatus()
              fetchConfig()
              fetchLogs()
            }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
            title="Refresh Telegram Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-md transition-all animate-in fade-in duration-200 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            )}
            <span className="text-sm font-semibold">{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-current"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2/3 Width): Connection Status, Overload Triggers, GitHub Webhooks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Telegram Account Link */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#24A1DE] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Telegram Account Link
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect Telegram bot to receive personal chat alerts
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {statusLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-[#24A1DE]" /> Checking...
                </div>
              ) : connStatus?.is_verified ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected & Active
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Not Connected
                </span>
              )}
            </div>

            {/* Connection Status Content */}
            {connStatus?.is_verified ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center font-black text-lg shadow-md shadow-sky-500/20">
                      {(connStatus.first_name?.[0] || connStatus.telegram_username?.[0] || 'T').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {connStatus.first_name ? `${connStatus.first_name} ${connStatus.last_name || ''}` : 'Telegram User'}
                      </h4>
                      <p className="text-xs text-[#24A1DE] font-mono font-bold">
                        @{connStatus.telegram_username || 'no_username'}
                      </p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                        Chat ID: {connStatus.chat_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendTestNotification}
                      disabled={actionLoading === 'test-send'}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-sky-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {actionLoading === 'test-send' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#24A1DE]" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      Test Alert
                    </button>
                    <button
                      onClick={handleDisconnect}
                      disabled={actionLoading === 'disconnect'}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {actionLoading === 'disconnect' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-slate-955 border border-sky-200 dark:border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#24A1DE]/10 text-[#24A1DE] flex items-center justify-center mx-auto border border-[#24A1DE]/20">
                    <Send className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Connect Your Telegram Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                      Link your account in 2 seconds to get automated Server Overload warnings and GitHub deployment notifications.
                    </p>
                  </div>

                  <button
                    onClick={handleConnectClick}
                    disabled={actionLoading === 'connect'}
                    className="px-6 py-3 rounded-2xl bg-[#24A1DE] hover:bg-[#1f8ebd] text-white font-extrabold text-sm flex items-center gap-2 mx-auto shadow-md shadow-sky-500/25 transition-all transform hover:scale-105 active:scale-95"
                  >
                    {actionLoading === 'connect' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating Link...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Connect Telegram Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Server Overload Notification Triggers */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <ServerIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Server Overload Notification Triggers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Automatically alerts Telegram when server usage exceeds safety thresholds
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestOverloadAlert}
                disabled={actionLoading === 'test-overload'}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all border border-amber-500/30"
              >
                {actionLoading === 'test-overload' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Test Overload Alert
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>CPU Threshold</span>
                  <span className="font-mono text-[#24A1DE] font-extrabold">{config.cpu_threshold}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={config.cpu_threshold}
                  onChange={(e) => setConfig({ ...config, cpu_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-[#24A1DE]"
                />
                <p className="text-[10px] text-slate-400">Alerts when CPU usage exceeds {config.cpu_threshold}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>RAM Threshold</span>
                  <span className="font-mono text-[#24A1DE] font-extrabold">{config.ram_threshold}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={config.ram_threshold}
                  onChange={(e) => setConfig({ ...config, ram_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-[#24A1DE]"
                />
                <p className="text-[10px] text-slate-400">Alerts when RAM usage exceeds {config.ram_threshold}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Disk Threshold</span>
                  <span className="font-mono text-[#24A1DE] font-extrabold">{config.disk_threshold}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={config.disk_threshold}
                  onChange={(e) => setConfig({ ...config, disk_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-[#24A1DE]"
                />
                <p className="text-[10px] text-slate-400">Alerts when Disk usage exceeds {config.disk_threshold}%</p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={configSaving}
                className="px-5 py-2.5 bg-[#24A1DE] hover:bg-[#1f8ebd] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
              >
                {configSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Threshold Rules
              </button>
            </div>
          </div>

          {/* Card 3: GitHub Repo Push Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    GitHub Repo Push Notifications
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive Telegram updates whenever a new push or commit comes to connected GitHub repos
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestGithubPush}
                disabled={actionLoading === 'test-push'}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center gap-1.5 transition-all border border-purple-500/30"
              >
                {actionLoading === 'test-push' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Test GitHub Push Alert
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                GitHub Webhook URL (Payload URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-3.5 py-2.5 bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 rounded-xl font-mono text-xs text-[#24A1DE] focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
                  className="px-4 py-2.5 bg-[#24A1DE] hover:bg-[#1f8ebd] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedWebhook ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#24A1DE]" /> GitHub Webhook Setup Guide:
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Go to your GitHub Repository &gt; <b>Settings</b> &gt; <b>Webhooks</b> &gt; <b>Add webhook</b>.</li>
                <li>Paste the copied URL into <b>Payload URL</b>.</li>
                <li>Set <b>Content type</b> to <code>application/json</code>.</li>
                <li>Select <b>Just the push event</b> and click <b>Add webhook</b>.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 Width): Admin Bot Settings & Dispatch Logs */}
        <div className="space-y-6">
          {/* Admin Bot Settings */}
          <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-[#24A1DE] flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Telegram Bot Settings
                </h4>
                <p className="text-[11px] text-slate-400">Admin Bot Token Configuration</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram Bot Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">@</span>
                  <input
                    type="text"
                    placeholder="deploymentmange_bot"
                    value={config.bot_username}
                    onChange={(e) => setConfig({ ...config, bot_username: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#24A1DE] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bot API Token
                </label>
                <input
                  type="password"
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={config.bot_token}
                  onChange={(e) => setConfig({ ...config, bot_token: e.target.value })}
                  className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#24A1DE] font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Obtained from Telegram @BotFather
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={configSaving}
              className="w-full py-2.5 bg-[#24A1DE] hover:bg-[#1f8ebd] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
            >
              {configSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
              Save Bot Credentials
            </button>
          </form>

          {/* Notification History Log */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#24A1DE]" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Recent Dispatch Logs
                </h4>
              </div>
              <button
                onClick={fetchLogs}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Refresh Logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {logsLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#24A1DE] mx-auto mb-1" /> Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No notification logs recorded yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {log.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          log.status === 'SENT'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{log.chat_id}</p>
                    <span className="text-[9px] text-slate-400 block">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Telegram Interactive Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-[#24A1DE] text-white flex items-center justify-center mx-auto shadow-xl shadow-sky-500/30">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Connect MonitorDep Telegram Bot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Follow the 2 simple steps below to link your Telegram chat
              </p>
            </div>

            {/* Steps Container */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#24A1DE] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 shadow-sm">
                  1
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Open our Telegram Bot
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click the button below to open Telegram app or Web.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-955 border border-sky-100 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#24A1DE] text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 shadow-sm">
                  2
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Press START in Telegram
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Press the big <code className="text-[#24A1DE] font-bold">START</code> button inside the Telegram bot chat.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Link Action Button */}
            <div className="space-y-3 pt-2">
              <a
                href={connectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-[#24A1DE] hover:bg-[#1f8ebd] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02]"
              >
                <span>Open Telegram Bot & Press START</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => copyToClipboard(connectLink, setCopiedLink)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLink ? 'Link Copied!' : 'Copy Direct Link'}
                </button>

                {verifying && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#24A1DE] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Waiting for /start...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
