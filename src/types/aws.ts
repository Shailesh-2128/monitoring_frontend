export interface AWSAccount {
  id: number
  name?: string
  account_name?: string
  access_key_masked?: string
  region?: string
  created_at?: string
}

export interface EC2Instance {
  id: string | number
  name?: string
  instance_id?: string
  instance_name?: string
  state: string
  instance_type: string
  public_ip: string
  private_ip: string
  launch_time: string
  availability_zone: string
}

export interface CloudWatchMetrics {
  cpu_utilization: number
  network_in_kb: number
  network_out_kb: number
  disk_read_bytes_mb: number
  disk_write_bytes_mb: number
  status_checks: string
  status_check_system: string
  status_check_instance: string
}

export interface EBSVolume {
  id: string
  size_gb: number
  volume_type: string
  encrypted: boolean
  iops: number
  throughput: number
  state: string
  attached_instance_id: string
}

export interface SecurityGroupRule {
  protocol: string
  port_range: string
  source?: string
  destination?: string
}

export interface SecurityGroup {
  id: string
  name: string
  description: string
  vpc_id: string
  inbound_rules: SecurityGroupRule[]
  outbound_rules: SecurityGroupRule[]
  open_ports: string[]
}

export interface ElasticIP {
  allocation_id: string
  public_ip: string
  associated_instance_id: string
  network_interface_id: string
}

export interface AWSTelemetryOverview {
  account: AWSAccount
  error_message?: string | null
  ec2_instances: EC2Instance[]
  cloudwatch_metrics: CloudWatchMetrics
  ebs_volumes: EBSVolume[]
  security_groups: SecurityGroup[]
  elastic_ips: ElasticIP[]
}

export interface AWSBudget {
  id: number
  aws_account: number
  name: string
  monthly_budget: number | string
  currency: string
  email_alert?: string | null
  enabled: boolean
  created_at?: string
}

export interface AWSCostOverview {
  current_month_cost: number
  today_cost: number
  yesterday_cost: number
  forecast_cost: number
  monthly_budget: number
  remaining_budget: number
  spent_percentage: number
  budget_name?: string
  currency?: string
  permission_granted?: boolean
  error_message?: string | null
}

export interface AWSDailyCostTrendPoint {
  date: string
  cost: number
}

export interface AWSServiceCost {
  service: string
  cost: number
  percentage: number
}

export interface AWSRegionCost {
  region: string
  region_name: string
  cost: number
  percentage: number
}

export interface AWSCostForecast {
  forecast_amount: number
  confidence_level: number
  current_month_cost?: number
  currency?: string
}

export interface AWSCostRecommendation {
  id: string
  resource_id: string
  resource_name: string
  resource_type: string
  metric_summary: string
  recommendation: string
  estimated_savings: number
}

export interface AWSCostRecommendationsPayload {
  recommendations: AWSCostRecommendation[]
  total_savings: number
}

