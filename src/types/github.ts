export interface GitHubProject {
  id: number
  name: string
  github_owner: string
  github_repo: string
  default_branch: string
  has_token: boolean
  masked_token?: string
  created_at: string
  updated_at: string
}

export interface CommitAuthor {
  name?: string
  email?: string
  username?: string
  avatar_url?: string
}

export interface Commit {
  sha: string
  short_sha: string
  message: string
  full_message?: string
  author?: CommitAuthor | null
  date: string
  html_url: string
}

export interface GitHubRepoDetails {
  id?: number
  name?: string
  full_name?: string
  owner?: string
  description?: string
  default_branch: string
  stars: number
  forks: number
  open_issues_count?: number
  visibility: string
  is_private: boolean
  html_url?: string
  updated_at?: string
  latest_commit?: Commit | null
  error?: string
}

export interface PullRequestItem {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  raw_state?: string
  is_merged: boolean
  author?: {
    username?: string
    avatar_url?: string
  } | null
  head_branch: string
  base_branch: string
  created_at: string
  updated_at?: string
  closed_at?: string
  merged_at?: string
  html_url: string
}

export interface PullRequestsSummary {
  open_count: number
  merged_count: number
  closed_count: number
  total_count: number
  pull_requests: PullRequestItem[]
  error?: string
}

export interface IssueItem {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  author?: {
    username?: string
    avatar_url?: string
  } | null
  labels: { name: string; color: string }[]
  comments_count: number
  created_at: string
  updated_at?: string
  closed_at?: string
  html_url: string
}

export interface IssuesSummary {
  open_count: number
  closed_count: number
  total_count: number
  issues: IssueItem[]
  error?: string
}

export interface WorkflowRunItem {
  id: number
  name: string
  status: 'queued' | 'in_progress' | 'completed' | string
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | string | null
  event: string
  head_branch: string
  head_sha: string
  actor?: {
    username?: string
    avatar_url?: string
  } | null
  started_at: string
  updated_at?: string
  duration_seconds: number
  duration_formatted: string
  html_url: string
}

export interface WorkflowRunsSummary {
  total_count: number
  workflow_runs: WorkflowRunItem[]
  error?: string
}

export interface ReleaseItem {
  id: number
  tag_name: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  published_at: string
  author?: {
    username?: string
    avatar_url?: string
  } | null
  html_url: string
}

export interface ReleasesSummary {
  total_count: number
  latest_release?: ReleaseItem | null
  releases: ReleaseItem[]
  error?: string
}

export interface GitHubProjectOverview {
  project: GitHubProject
  repository: GitHubRepoDetails
  pull_requests: PullRequestsSummary
  issues: IssuesSummary
  actions: WorkflowRunsSummary
  releases: ReleasesSummary
}
