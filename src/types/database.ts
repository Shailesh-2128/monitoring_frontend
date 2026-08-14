export interface ConnectionMetrics {
  active: number
  total: number
  max: number
  usage_percent: number
}

export interface TableSizeMetric {
  schema: string
  table: string
  size_bytes: number
}

export interface IndexSizeMetric {
  schema: string
  table: string
  index_name: string
  size_bytes: number
}

export interface LockMetrics {
  total: number
  waiting: number
}

export interface LongRunningQuery {
  pid?: number
  duration: number
  state?: string
  query: string
}

export interface SlowQuery {
  query: string
  calls: number
  total_exec_time_ms: number
  mean_exec_time_ms: number
  rows: number
}

export interface TransactionMetrics {
  commits: number
  rollbacks: number
  rollback_rate_percent: number
  tup_inserted: number
  tup_updated: number
  tup_deleted: number
}

export interface CacheMetrics {
  hit_ratio_percent: number
}

export interface ColumnInfo {
  name: string
  type: string
  is_nullable: boolean
}

export interface SchemaTableInfo {
  schema: string
  table: string
  columns: ColumnInfo[]
}

export interface CloudInfrastructureMetrics {
  provider: 'Supabase' | 'Neon' | string
  status?: string
  error?: string
  supabase_url?: string
  cpu_usage_percent?: number
  ram_used_bytes?: number
  ram_total_bytes?: number
  ram_usage_percent?: number
  disk_read_bytes?: number
  disk_write_bytes?: number
  storage_bytes?: number
  compute_units?: number
  compute_state?: string
  autoscaling_limits?: { min_cu: number; max_cu: number }
}

export interface TelemetryDetails {
  health?: { status: string; latency_ms: number }
  size?: { bytes: number }
  connections?: ConnectionMetrics
  tables?: { count: number; largest?: TableSizeMetric[] }
  indexes?: { largest?: IndexSizeMetric[] }
  locks?: LockMetrics
  queries?: {
    long_running?: LongRunningQuery[]
    slow_queries_enabled?: boolean
    slow_queries?: SlowQuery[]
  }
  transactions?: TransactionMetrics
  cache?: CacheMetrics
  schema?: { tables?: SchemaTableInfo[] }
  cloud_infrastructure?: CloudInfrastructureMetrics
  msg?: string
  [key: string]: any
}

export interface LatestDbCheck {
  status: string
  response_time?: number
  database_size?: number
  active_connections?: number
  long_running_queries?: LongRunningQuery[]
  error_message?: string
  details?: TelemetryDetails
  checked_at: string
}

export interface Database {
  id: number
  project: string
  name: string
  db_type: string
  host: string
  port: number
  database_name?: string
  username?: string
  connection_uri?: string
  project_ref?: string
  api_key?: string
  check_interval: number
  enabled: boolean
  latest_check?: LatestDbCheck | null
}

export interface DatabaseMetricsHistory {
  uptime_percentage: number
  average_response_time: number
  current_size?: number | null
  current_connections?: number | null
  history: Array<{
    timestamp: string
    response_time: number | null
    status: string
    database_size?: number | null
    active_connections?: number | null
  }>
}
