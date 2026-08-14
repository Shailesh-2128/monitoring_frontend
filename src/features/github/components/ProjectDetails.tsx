import React, { useState } from 'react'
import {
  GitBranch,
  Star,
  GitFork,
  Shield,
  ExternalLink,
  RefreshCw,
  Trash2,
  Settings,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  PlayCircle,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Globe
} from 'lucide-react'
import {
  GitHubProject,
  GitHubRepoDetails,
  Commit,
  PullRequestsSummary,
  IssuesSummary,
  WorkflowRunsSummary,
  ReleasesSummary
} from '../../../types/github'

interface ProjectDetailsProps {
  project: GitHubProject
  repoDetails: GitHubRepoDetails | null
  commits: Commit[]
  pullRequests: PullRequestsSummary | null
  issues: IssuesSummary | null
  workflowRuns: WorkflowRunsSummary | null
  releases: ReleasesSummary | null
  loading: boolean
  onRefresh: () => void
  onDelete?: () => void
  onEdit?: () => void
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  repoDetails,
  commits,
  pullRequests,
  issues,
  workflowRuns,
  releases,
  loading,
  onRefresh,
  onDelete,
  onEdit
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'commits' | 'prs' | 'issues' | 'actions' | 'releases'>('overview')
  const [prFilter, setPrFilter] = useState<'all' | 'open' | 'merged' | 'closed'>('all')
  const [issueFilter, setIssueFilter] = useState<'all' | 'open' | 'closed'>('all')

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return 'N/A'
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
      if (diffSec < 60) return `${diffSec}s ago`
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `${diffMin} min ago`
      const diffHours = Math.floor(diffMin / 60)
      if (diffHours < 24) return `${diffHours} hr ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 30) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return isoString
    }
  }

  // Filter PRs
  const filteredPrs = (pullRequests?.pull_requests || []).filter(pr => {
    if (prFilter === 'open') return pr.state === 'open'
    if (prFilter === 'merged') return pr.is_merged
    if (prFilter === 'closed') return pr.state === 'closed' && !pr.is_merged
    return true
  })

  // Filter Issues
  const filteredIssues = (issues?.issues || []).filter(issue => {
    if (issueFilter === 'open') return issue.state === 'open'
    if (issueFilter === 'closed') return issue.state === 'closed'
    return true
  })

  const latestRelease = releases?.latest_release || (releases?.releases && releases.releases[0])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6 text-slate-900 dark:text-slate-100 font-sans pb-12">
      {/* Top Header Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{project.name}</h1>
            <a
              href={`https://github.com/${project.github_owner}/${project.github_repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-1 rounded-lg font-semibold"
            >
              {project.github_owner}/{project.github_repo}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">
              <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {project.default_branch}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">
              {repoDetails?.is_private ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Public
                </>
              )}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              {repoDetails?.stars ?? 0} Stars
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">
              <GitFork className="w-3.5 h-3.5 text-slate-400" />
              {repoDetails?.forks ?? 0} Forks
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              {project.has_token ? 'PAT Token Encrypted' : 'No Token Saved'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold"
              title="Edit Settings / Update PAT Token"
            >
              <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Settings
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh GitHub Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            Refresh
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl transition-all border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 text-xs font-semibold ml-1"
              title="Delete GitHub Project"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Card if GitHub returns 404 / error */}
      {repoDetails?.error && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-3 animate-fadeIn text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                GitHub Repository Access Issue (404 Not Found)
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                GitHub returned <code className="text-amber-700 dark:text-amber-300 font-mono bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">404 Not Found</code> when requesting <strong className="text-slate-900 dark:text-slate-100">{project.github_owner}/{project.github_repo}</strong>.
              </p>
              <div className="bg-slate-100 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-200">Why GitHub returns 404 for Private Repositories:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong>Personal Access Token (PAT) Missing or Invalid:</strong> No PAT token is saved for this project, or the token has expired.</li>
                  <li><strong>Classic PAT Scope:</strong> The token lacks the <code className="text-indigo-600 dark:text-indigo-400 font-mono">repo</code> scope (Full control of private repositories).</li>
                  <li><strong>Fine-Grained PAT Access:</strong> The token does not include <strong className="text-slate-900 dark:text-slate-200">{project.github_repo}</strong> in repository access, or lacks <code className="text-indigo-600 dark:text-indigo-400 font-mono">Contents: Read-only</code> permission.</li>
                  <li><strong>Typo in Repo / Owner Name:</strong> Verify owner (<strong className="text-slate-900 dark:text-slate-200">{project.github_owner}</strong>) and repository name (<strong className="text-slate-900 dark:text-slate-200">{project.github_repo}</strong>).</li>
                </ul>
              </div>

              {onEdit && (
                <div className="pt-1">
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Update PAT Token / Repository Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Commit */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Latest Commit</span>
            <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          {repoDetails?.latest_commit ? (
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {repoDetails.latest_commit.message}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">{repoDetails.latest_commit.short_sha}</span>
                <span>{formatRelativeTime(repoDetails.latest_commit.date)}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No commits found</span>
          )}
        </div>

        {/* PR Status */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Pull Requests</span>
            <GitPullRequest className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{pullRequests?.open_count ?? 0}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Open</span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{pullRequests?.merged_count ?? 0}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Merged</span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-xl font-bold text-slate-600 dark:text-slate-400">{pullRequests?.closed_count ?? 0}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Closed</span>
            </div>
          </div>
        </div>

        {/* Issues Status */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Issues</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{issues?.open_count ?? 0}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Open</span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
              <span className="text-xl font-bold text-slate-600 dark:text-slate-400">{issues?.closed_count ?? 0}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Closed</span>
            </div>
          </div>
        </div>

        {/* Latest Release */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <span>Latest Release</span>
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          {latestRelease ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 font-mono px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-md">
                  {latestRelease.tag_name}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{latestRelease.name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {formatRelativeTime(latestRelease.published_at)}
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No release published</span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSubTab('commits')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'commits'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          Commits
        </button>
        <button
          onClick={() => setActiveSubTab('prs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'prs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          Pull Requests ({pullRequests?.total_count ?? 0})
        </button>
        <button
          onClick={() => setActiveSubTab('issues')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'issues'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Issues ({issues?.total_count ?? 0})
        </button>
        <button
          onClick={() => setActiveSubTab('actions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'actions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          GitHub Actions
        </button>
        <button
          onClick={() => setActiveSubTab('releases')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'releases'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Releases
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Workflow Runs Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Latest GitHub Actions Runs
              </h3>
              <button
                onClick={() => setActiveSubTab('actions')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                View all
              </button>
            </div>

            {workflowRuns?.workflow_runs && workflowRuns.workflow_runs.length > 0 ? (
              <div className="space-y-2.5">
                {workflowRuns.workflow_runs.slice(0, 5).map((run) => {
                  const isSuccess = run.conclusion === 'success'
                  const isFailed = run.conclusion === 'failure'
                  const isInProgress = run.status === 'in_progress'

                  return (
                    <div
                      key={run.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : isFailed ? (
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : isInProgress ? (
                          <Clock className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {run.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {run.head_branch} ({run.head_sha})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <span className={`font-semibold capitalize text-[11px] block ${
                            isSuccess ? 'text-emerald-600 dark:text-emerald-400' : isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {isSuccess ? '🟢 Success' : isFailed ? '🔴 Failed' : isInProgress ? '🟡 Running' : run.status}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {run.duration_formatted} • {formatRelativeTime(run.started_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                No workflow runs recorded yet.
              </div>
            )}
          </div>

          {/* Recent Commits Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Recent Commit Activity
              </h3>
              <button
                onClick={() => setActiveSubTab('commits')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                View all
              </button>
            </div>

            {commits && commits.length > 0 ? (
              <div className="space-y-2.5">
                {commits.slice(0, 5).map((commit) => (
                  <div
                    key={commit.sha}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {commit.author?.avatar_url ? (
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author?.username || commit.author?.name || 'Author'}
                          className="w-6 h-6 rounded-full shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-[10px] font-bold shrink-0">
                          {(commit.author?.username || commit.author?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {commit.message}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {commit.author?.username || commit.author?.name || 'Unknown Author'} • {formatRelativeTime(commit.date)}
                        </span>
                      </div>
                    </div>

                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] shrink-0 font-medium"
                    >
                      {commit.short_sha}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                No commit activity recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commits Tab */}
      {activeSubTab === 'commits' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Commit History ({commits?.length ?? 0})
          </h3>

          {commits && commits.length > 0 ? (
            <div className="space-y-2.5">
              {commits.map((commit) => (
                <div
                  key={commit.sha}
                  className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {commit.author?.avatar_url ? (
                      <img
                        src={commit.author.avatar_url}
                        alt={commit.author?.username || commit.author?.name || 'Author'}
                        className="w-7 h-7 rounded-full shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-[10px] font-bold shrink-0">
                        {(commit.author?.username || commit.author?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {commit.message}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {commit.author?.username || commit.author?.name || 'Unknown Author'} • {formatRelativeTime(commit.date)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] shrink-0 font-medium"
                  >
                    {commit.short_sha}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              No commit activity recorded.
            </div>
          )}
        </div>
      )}

      {/* Pull Requests Tab */}
      {activeSubTab === 'prs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Pull Requests ({pullRequests?.total_count ?? 0})
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setPrFilter('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  prFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPrFilter('open')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  prFilter === 'open' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Open ({pullRequests?.open_count ?? 0})
              </button>
              <button
                onClick={() => setPrFilter('merged')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  prFilter === 'merged' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Merged ({pullRequests?.merged_count ?? 0})
              </button>
              <button
                onClick={() => setPrFilter('closed')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  prFilter === 'closed' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Closed ({pullRequests?.closed_count ?? 0})
              </button>
            </div>
          </div>

          {filteredPrs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredPrs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                    >
                      #{pr.number} {pr.title}
                    </a>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>opened by {pr.author?.username || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(pr.created_at)}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    pr.is_merged
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                      : pr.state === 'open'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {pr.is_merged ? 'MERGED' : pr.state.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              No pull requests matching filter.
            </div>
          )}
        </div>
      )}

      {/* Issues Tab */}
      {activeSubTab === 'issues' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Issues ({issues?.total_count ?? 0})
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setIssueFilter('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  issueFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setIssueFilter('open')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  issueFilter === 'open' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Open ({issues?.open_count ?? 0})
              </button>
              <button
                onClick={() => setIssueFilter('closed')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  issueFilter === 'closed' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Closed ({issues?.closed_count ?? 0})
              </button>
            </div>
          </div>

          {filteredIssues.length > 0 ? (
            <div className="space-y-2.5">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                    >
                      #{issue.number} {issue.title}
                    </a>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>opened by {issue.author?.username || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(issue.created_at)}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    issue.state === 'open'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {issue.state.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              No issues matching filter.
            </div>
          )}
        </div>
      )}

      {/* GitHub Actions Tab */}
      {activeSubTab === 'actions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            GitHub Actions Workflows ({workflowRuns?.workflow_runs?.length ?? 0})
          </h3>

          {workflowRuns?.workflow_runs && workflowRuns.workflow_runs.length > 0 ? (
            <div className="space-y-2.5">
              {workflowRuns.workflow_runs.map((run) => {
                const isSuccess = run.conclusion === 'success'
                const isFailed = run.conclusion === 'failure'
                const isInProgress = run.status === 'in_progress'

                return (
                  <div
                    key={run.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isFailed ? (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : isInProgress ? (
                        <Clock className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                          {run.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {run.head_branch} ({run.head_sha})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <span className={`font-semibold capitalize text-[11px] block ${
                          isSuccess ? 'text-emerald-600 dark:text-emerald-400' : isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {isSuccess ? '🟢 Success' : isFailed ? '🔴 Failed' : isInProgress ? '🟡 Running' : run.status}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {run.duration_formatted} • {formatRelativeTime(run.started_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              No workflow runs recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Releases Tab */}
      {activeSubTab === 'releases' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Repository Releases ({releases?.releases?.length ?? 0})
          </h3>

          {releases?.releases && releases.releases.length > 0 ? (
            <div className="space-y-4">
              {releases.releases.map((rel) => (
                <div
                  key={rel.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-300 font-mono px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-md">
                        {rel.tag_name}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rel.name}</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Published {formatRelativeTime(rel.published_at)}
                    </span>
                  </div>

                  {rel.body && (
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pt-1">
                      {rel.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              No releases published yet.
            </div>
          )}
        </div>
      )}

    </div>
  )
}
