export interface WebsiteCheck {
  status: string // Online, Offline, DNS Error, SSL Error
  http_status: number | null
  response_time: number | null
  ssl_expiry: string | null
  ssl_valid: boolean
  redirected: boolean
  redirect_url: string | null
  checked_at: string
}

export interface Website {
  id: number
  project: string
  name: string
  url: string
  expected_status: number
  check_interval: number
  enabled: boolean
  latest_check: WebsiteCheck | null
}

export interface WebsiteHistoryPoint {
  timestamp: string
  response_time: number | null
  status: string
  http_status: number | null
  ssl_valid: boolean
}
