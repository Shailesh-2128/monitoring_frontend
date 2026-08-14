export type ModuleKey = 'servers' | 'websites' | 'databases' | 'github' | 'aws' | 'aws_costing' | 'telegram' | 'iam'


export type PermissionLevel = 'none' | 'read' | 'write'

export type PermissionMap = Record<ModuleKey, PermissionLevel>

export interface Team {
  id: number
  name: string
  description: string
  permissions?: PermissionMap
  members_count?: number
  created_at?: string
  updated_at?: string
}

export interface Role {
  id: number
  name: string
  description: string
  is_system_role: boolean
  permissions: PermissionMap
  profiles_count?: number
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: number
  is_superadmin: boolean
  job_title: string
  role: number | null
  team: number | null
  role_details?: Role
  team_details?: Team
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  date_joined: string
  last_login: string | null
  profile?: UserProfile
  permissions?: PermissionMap
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
