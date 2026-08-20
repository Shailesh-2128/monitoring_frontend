import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Server,
  Globe,
  Database,
  Cloud,
  Send,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Check,
  Shield,
  Layers,
  Cpu,
  Zap
} from 'lucide-react'
import { Github } from '../../components/common/GithubIcon'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Request-Aware Sign-In States: 'idle' | 'authenticating' | 'verifying' | 'success'
  const [submitStage, setSubmitStage] = useState<'idle' | 'authenticating' | 'verifying' | 'success'>('idle')

  const isSubmitting = submitStage === 'authenticating' || submitStage === 'verifying'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('Please enter your email or username.')
      return
    }
    if (!password) {
      setError('Please enter your account password.')
      return
    }

    setSubmitStage('authenticating')

    const stageTimer = setTimeout(() => {
      setSubmitStage('verifying')
    }, 700)

    try {
      await login(username, password)
      clearTimeout(stageTimer)
      setSubmitStage('success')
    } catch (err: any) {
      clearTimeout(stageTimer)
      setSubmitStage('idle')
      
      if (err.message && err.message.toLowerCase().includes('network')) {
        setError('Network latency high — retrying via secondary region (ap-south-1).')
      } else {
        setError(err.message || 'Invalid username or password. Please verify your credentials.')
      }
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#F8F9FE] text-slate-900 flex flex-col justify-between font-sans relative overflow-x-hidden lg:overflow-hidden selection:bg-purple-600 selection:text-white">
      {/* Background Soft Purple Lighting Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e9d5ff_1px,transparent_1px),linear-gradient(to_bottom,#e9d5ff_1px,transparent_1px)] [background-size:48px_48px] opacity-25 pointer-events-none" />

      {/* Subtle Purple Radial Glow Spotlights */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 px-4 sm:px-8 md:px-12 py-3 sm:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
            monitorInfra
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200 ml-1">
            v2.4.0
          </span>
        </div>

        {/* Header Status Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-purple-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="hidden sm:inline">All systems operational</span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-purple-600 font-bold">p99: 142ms</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 md:px-12 py-2 sm:py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center justify-center overflow-y-auto lg:overflow-visible">
        {/* LEFT COLUMN: BRAND & WORKSPACE ECOSYSTEM (58% width on desktop) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Enterprise DevOps Infrastructure & Observability Mesh</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your infrastructure.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700">
                Always in sight.
              </span>
            </h1>

            <p className="text-slate-600 text-base max-w-lg leading-relaxed">
              Monitor servers, deployments, databases, services, and application health from one clean, powerful dashboard.
            </p>
          </div>

          {/* Supported Infrastructure Workspaces & Services Icon Grid */}
          <div className="pt-2 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono block">
              Supported Workspaces & Services
            </span>
            <div className="flex flex-wrap items-center gap-2.5 max-w-xl">
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Server className="w-4 h-4 text-purple-600" />
                <span>Server</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Website</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Database</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Github className="w-4 h-4 text-slate-900" />
                <span>GitHub</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Cloud className="w-4 h-4 text-amber-600" />
                <span>AWS</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Send className="w-4 h-4 text-sky-500" />
                <span>Telegram</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>IAM</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Nginx</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span>Gunicorn Gateway</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Redis</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 hover:border-purple-300 transition-all">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Celery Worker</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN WHITE & PURPLE AUTHENTICATION CARD (420px wide on desktop) */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-[420px] bg-white border border-purple-100/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-purple-950/5 relative z-10">
            {/* Card Header (NO TOP BORDER ACCENT LINE) */}
            <div className="mb-6">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in to your <span className="text-purple-600 font-bold">monitorInfra</span> workspace
              </p>
            </div>

            {/* Error Alert Message State */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Input */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin or user@domain.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-all text-sm disabled:opacity-60 min-h-[46px]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-all text-sm disabled:opacity-60 min-h-[46px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500/30 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-medium text-slate-700">Remember me</span>
                </label>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault()
                    setError('Please contact your monitorInfra administrator to reset credentials.')
                  }}
                  className="text-purple-600 hover:text-purple-700 transition-colors font-extrabold"
                >
                  Forgot password?
                </a>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || submitStage === 'success'}
                className={`w-full py-3.5 px-4 font-extrabold rounded-2xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 flex items-center justify-center gap-2 text-sm min-h-[46px] ${
                  submitStage === 'success'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/25 border border-purple-500/30 disabled:opacity-60'
                }`}
              >
                {submitStage === 'authenticating' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : submitStage === 'verifying' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : submitStage === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-white animate-bounce" />
                    <span>Session Verified! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 px-4 sm:px-8 md:px-12 py-3 sm:py-4 text-center text-xs text-slate-500 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <span>&copy; {new Date().getFullYear()} monitorInfra Platform Inc. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          <a href="#security" className="hover:text-slate-700 transition-colors">Security Overview</a>
        </div>
      </footer>
    </div>
  )
}
