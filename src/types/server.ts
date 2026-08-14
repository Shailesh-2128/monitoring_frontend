export interface LatestReading {
  timestamp: string
  cpu: number
  ram: number
  disk: number
  disk_free: number
  disk_used: number
  network_upload: number
  network_download: number
  uptime: number
  process_count: number
  services?: Record<string, boolean>
}

export interface Server {
  id: number
  project_name: string
  name: string
  hostname: string
  os: string
  environment: string
  public_ip: string
  private_ip: string
  token: string
  cpu_model: string
  total_ram: number
  total_disk: number
  is_online: boolean
  last_seen: string | null
  latest_reading: LatestReading | null
}

export interface Process {
  pid: number
  name: string
  cpu_percent: number
  memory_percent: number
}

export interface DetailedServer extends Server {
  latest_reading: LatestReading & {
    swap_percent: number
    load_average_1m: number
    load_average_5m: number
    load_average_15m: number
    top_processes: Process[]
  } | null
}

export interface MetricHistoryPoint {
  timestamp: string
  cpu_percent: number
  ram_percent: number
  disk_percent: number
  network_upload: number
  network_download: number
  swap_percent: number
  load_average_1m: number
  uptime: number
}
