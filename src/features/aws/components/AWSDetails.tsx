import React, { useState } from 'react'
import {
  Cloud,
  Server,
  Activity,
  HardDrive,
  Shield,
  Globe,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Lock,
  Cpu,
  ArrowUpRight,
  ArrowDownLeft,
  Key,
  AlertTriangle
} from 'lucide-react'
import { AWSTelemetryOverview } from '../../../types/aws'

interface AWSDetailsProps {
  awsOverview: AWSTelemetryOverview | null
  loading: boolean
  onRefresh: () => void
  onDelete?: () => void
}

export const AWSDetails: React.FC<AWSDetailsProps> = ({
  awsOverview,
  loading,
  onRefresh,
  onDelete
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ec2' | 'cloudwatch' | 'ebs' | 'sg' | 'eip'>('ec2')

  if (!awsOverview) return null

  const { account, ec2_instances, cloudwatch_metrics, ebs_volumes, security_groups, elastic_ips, error_message } = awsOverview

  const safeEc2 = ec2_instances || []
  const safeEbs = ebs_volumes || []
  const safeSg = security_groups || []
  const safeEip = elastic_ips || []
  const safeCw = cloudwatch_metrics || {
    cpu_utilization: 0,
    network_in_kb: 0,
    network_out_kb: 0,
    disk_read_bytes_mb: 0,
    disk_write_bytes_mb: 0,
    status_checks: 'N/A',
    status_check_system: 'N/A',
    status_check_instance: 'N/A'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn font-sans text-slate-900 dark:text-slate-100 pb-12">
      {/* Top Header Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cloud className="w-7 h-7 text-amber-500" />
              {account.name}
            </h1>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
              {account.region}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-mono">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              Access Key: {account.access_key_masked}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AWS Cloud Connected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh AWS Infrastructure Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            Refresh Telemetry
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl transition-all border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 text-xs font-semibold ml-1"
              title="Disconnect AWS Account"
            >
              <Trash2 className="w-4 h-4" />
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Notice Message if AWS returns warnings */}
      {error_message && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p>{error_message}</p>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ec2')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'ec2'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          EC2 Instances ({safeEc2.length})
        </button>

        <button
          onClick={() => setActiveSubTab('cloudwatch')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'cloudwatch'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          CloudWatch Metrics
        </button>

        <button
          onClick={() => setActiveSubTab('ebs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'ebs'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          EBS Volumes ({safeEbs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('sg')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'sg'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Security Groups ({safeSg.length})
        </button>

        <button
          onClick={() => setActiveSubTab('eip')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'eip'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Elastic IPs ({safeEip.length})
        </button>
      </div>

      {/* Sub-Tab 1: EC2 Instances */}
      {activeSubTab === 'ec2' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-500" />
              EC2 Compute Instances Summary ({safeEc2.length})
            </h3>
          </div>

          {safeEc2.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No EC2 Instances found in region <code className="font-mono text-amber-600 dark:text-amber-400">{account.region}</code>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Instance Name</th>
                    <th className="py-3 px-4">Instance ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Public IP</th>
                    <th className="py-3 px-4">Private IP</th>
                    <th className="py-3 px-4">Availability Zone</th>
                    <th className="py-3 px-4 rounded-r-lg">Launch Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {safeEc2.map((inst) => {
                    const instName = inst.instance_name || inst.name || 'Unnamed Instance'
                    const instId = inst.instance_id || (typeof inst.id === 'string' ? inst.id : `i-${inst.id}`)
                    return (
                      <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all font-mono">
                        <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-sans text-sm">
                          {instName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[11px]">
                            {instId}
                          </span>
                        </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          inst.state === 'running'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${inst.state === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          {inst.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">{inst.instance_type}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{inst.public_ip}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{inst.private_ip}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{inst.availability_zone}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-sans">{inst.launch_time}</td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: CloudWatch Metrics */}
      {activeSubTab === 'cloudwatch' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <span>CPU Utilization</span>
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {safeCw.cpu_utilization ? safeCw.cpu_utilization.toFixed(1) : '0.0'}%
              </div>
              <span className="text-[10px] text-slate-400 block">Average past 5-min window</span>
            </div>

            {/* Network In */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <span>Network In</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {safeCw.network_in_kb ? safeCw.network_in_kb.toFixed(1) : '0.0'} <span className="text-xs">KB/s</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Inbound bandwidth traffic</span>
            </div>

            {/* Network Out */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <span>Network Out</span>
                <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                {safeCw.network_out_kb ? safeCw.network_out_kb.toFixed(1) : '0.0'} <span className="text-xs">KB/s</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Outbound response traffic</span>
            </div>

            {/* Status Checks */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <span>Status Checks</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {safeCw.status_checks}
              </div>
              <span className="text-[10px] text-slate-400 block">System & Instance Probes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Disk Read / Write Bytes</h4>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Disk Read Bytes</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1 block">
                    {safeCw.disk_read_bytes_mb ? safeCw.disk_read_bytes_mb.toFixed(1) : '0.0'} MB
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Disk Write Bytes</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1 block">
                    {safeCw.disk_write_bytes_mb ? safeCw.disk_write_bytes_mb.toFixed(1) : '0.0'} MB
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hardware & Hypervisor Checks</h4>
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">System Status Check (AWS Host)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{safeCw.status_check_system}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Instance Status Check (Guest OS)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{safeCw.status_check_instance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: EBS Volumes */}
      {activeSubTab === 'ebs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-500" />
              Elastic Block Store (EBS) Volumes ({safeEbs.length})
            </h3>
          </div>

          {safeEbs.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No EBS Storage Volumes found in region <code className="font-mono text-amber-600 dark:text-amber-400">{account.region}</code>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Volume ID</th>
                    <th className="py-3 px-4">Size (GB)</th>
                    <th className="py-3 px-4">Volume Type</th>
                    <th className="py-3 px-4">Encryption</th>
                    <th className="py-3 px-4">IOPS / Throughput</th>
                    <th className="py-3 px-4 rounded-r-lg">Attachment Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                  {safeEbs.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{vol.id}</td>
                      <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">{vol.size_gb} GB</td>
                      <td className="py-3.5 px-4 uppercase font-semibold text-slate-700 dark:text-slate-300">{vol.volume_type}</td>
                      <td className="py-3.5 px-4">
                        {vol.encrypted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" /> Encrypted
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            Unencrypted
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{vol.iops} IOPS • {vol.throughput} MB/s</td>
                      <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-semibold">{vol.attached_instance_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Security Groups */}
      {activeSubTab === 'sg' && (
        <div className="space-y-6">
          {safeSg.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No Security Groups found in region <code className="font-mono text-amber-600 dark:text-amber-400">{account.region}</code>.
            </div>
          ) : (
            safeSg.map((sg) => (
              <div key={sg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base font-mono flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-500" />
                      {sg.name} <span className="text-xs text-slate-400 font-normal">({sg.id})</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sg.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Open Ports:</span>
                    {sg.open_ports.map((port) => (
                      <span key={port} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-mono text-[10px] font-bold rounded-md">
                        Port {port}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inbound Rules */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Inbound Rules</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                      <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3 rounded-l-lg">Protocol</th>
                          <th className="py-2 px-3">Port Range</th>
                          <th className="py-2 px-3 rounded-r-lg">Source IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {sg.inbound_rules.map((rule, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 uppercase text-indigo-600 dark:text-indigo-400 font-bold">{rule.protocol}</td>
                            <td className="py-2 px-3 text-slate-900 dark:text-slate-100">{rule.port_range}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{rule.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-Tab 5: Elastic IPs */}
      {activeSubTab === 'eip' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Elastic IP Addresses ({safeEip.length})
            </h3>
          </div>

          {safeEip.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              No Elastic IP Addresses allocated in region <code className="font-mono text-amber-600 dark:text-amber-400">{account.region}</code>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Public IP Address</th>
                    <th className="py-3 px-4">Associated Instance</th>
                    <th className="py-3 px-4">Allocation ID</th>
                    <th className="py-3 px-4 rounded-r-lg">Network Interface ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                  {safeEip.map((eip) => (
                    <tr key={eip.allocation_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{eip.public_ip}</td>
                      <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">{eip.associated_instance_id}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{eip.allocation_id}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{eip.network_interface_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
