import React, { useState } from 'react'
import {
  BookOpen, X, Copy, Check, Terminal, Cpu, HardDrive, Network,
  Activity, ShieldCheck, Server, AlertCircle, Play, Layers, ExternalLink, Zap
} from 'lucide-react'

interface ServerDocModalProps {
  isOpen: boolean
  onClose: () => void
  API_BASE?: string
}

export const ServerDocModal: React.FC<ServerDocModalProps> = ({ isOpen, onClose, API_BASE }) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'systemd' | 'windows' | 'payload' | 'faq'>('quick')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const backendUrl = API_BASE || 'http://localhost:8000'

  const copySnippet = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const sampleConfigJson = `{
  "backend_url": "${backendUrl}",
  "server_id": 1,
  "token": "YOUR_SERVER_TOKEN_HERE"
}`

  const systemdServiceFile = `[Unit]
Description=MonitorDep Server Telemetry Monitoring Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/monitoring_agent
ExecStart=/usr/bin/python3 /opt/monitoring_agent/agent.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`

  const systemdCommands = `sudo cp agent.py agent_config.json /opt/monitoring_agent/
sudo nano /etc/systemd/system/monitordep-agent.service
sudo systemctl daemon-reload
sudo systemctl enable monitordep-agent
sudo systemctl start monitordep-agent
sudo systemctl status monitordep-agent`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl transition-all flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 font-mono">
                  MONITORDEP // DOCUMENTATION
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AGENT v2.4
                </span>
              </div>
              <h2 className="text-lg font-bold">Agent Installation & Deployment Guide</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Header Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-6 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'quick'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" /> Quick Overview & Token
          </button>
          <button
            onClick={() => setActiveTab('systemd')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'systemd'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> Linux Systemd Daemon
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'windows'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" /> Windows Server Service
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* TAB 1: QUICK SETUP GUIDE */}
          {activeTab === 'quick' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <p className="font-extrabold text-sm mb-1 text-indigo-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  What is MonitorDep Agent?
                </p>
                MonitorDep Monitoring Agent is a cross-platform (Linux, Windows, macOS) lightweight telemetry daemon written in Python. It captures Real-time CPU utilization, RAM usage, Swap space, Disk partitions, Network Bandwidth (Upload/Download rates), System Load Averages, Top 5 Consuming Processes, and System Services (Nginx, Redis, Gunicorn, Celery) every 15 seconds.
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono">1</span>
                  Install Agent Dependencies
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ensure Python 3.8+ is installed on your server node, then install the required Python telemetry libraries:
                </p>

                <div className="relative bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs border border-slate-800 flex items-center justify-between group">
                  <code>pip install psutil requests pyyaml</code>
                  <button
                    onClick={() => copySnippet("pip install psutil requests pyyaml", 1)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all flex items-center gap-1 text-[11px]"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono">2</span>
                  Register Server Node & Obtain Token
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Click the <strong>"+ Add Server"</strong> button on the DeployOps dashboard. Enter your server node name (e.g. <code>Prod-Web-Node-01</code>) and environment. DeployOps will generate a unique <code>SERVER_ID</code> and <code>SERVER_TOKEN</code>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono">3</span>
                  Create Configuration File (`agent_config.json`)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Create `agent_config.json` inside your agent directory on the target server:
                </p>

                <div className="relative bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800 group">
                  <button
                    onClick={() => copySnippet(sampleConfigJson, 3)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all flex items-center gap-1 text-[11px]"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? 'Copied' : 'Copy'}</span>
                  </button>
                  <pre className="text-blue-300">{sampleConfigJson}</pre>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono">4</span>
                  Run Agent Script
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Execute the agent script manually to verify initial telemetry reporting:
                </p>

                <div className="relative bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs border border-slate-800 flex items-center justify-between group">
                  <code>python agent.py</code>
                  <button
                    onClick={() => copySnippet("python agent.py", 4)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all flex items-center gap-1 text-[11px]"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 4 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEMD SERVICE SETUP */}
          {activeTab === 'systemd' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                  Linux Systemd Service Setup (Ubuntu / Debian / RHEL / CentOS)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Run the agent as a background daemon that automatically starts on server reboot and restarts if terminated.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  1. Systemd Service File: <code>/etc/systemd/system/deployops-agent.service</code>
                </span>

                <div className="relative bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800 group">
                  <button
                    onClick={() => copySnippet(systemdServiceFile, 10)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all flex items-center gap-1 text-[11px]"
                  >
                    {copiedIndex === 10 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 10 ? 'Copied File' : 'Copy File'}</span>
                  </button>
                  <pre className="text-cyan-300">{systemdServiceFile}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  2. Enable & Start Systemd Daemon
                </span>

                <div className="relative bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs border border-slate-800 group">
                  <button
                    onClick={() => copySnippet(systemdCommands, 11)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all flex items-center gap-1 text-[11px]"
                  >
                    {copiedIndex === 11 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 11 ? 'Copied Commands' : 'Copy Commands'}</span>
                  </button>
                  <pre className="text-emerald-400">{systemdCommands}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WINDOWS SERVICE SETUP */}
          {activeTab === 'windows' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                  Windows Server Service Setup
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Configure `monitoring_agent` to run continuously on Windows Server 2019/2022 or Windows 10/11.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" /> Option A: NSSM (Non-Sucking Service Manager)
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>Download <strong>NSSM</strong> from <code>nssm.cc</code></li>
                  <li>Open Administrator PowerShell and run: <code>nssm install DeployOpsAgent</code></li>
                  <li>Set Application Path: <code>C:\Python311\python.exe</code></li>
                  <li>Set Startup Directory: <code>C:\deployops_agent</code></li>
                  <li>Set Arguments: <code>C:\deployops_agent\agent.py</code></li>
                  <li>Run: <code>nssm start DeployOpsAgent</code></li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-500" /> Option B: Windows Task Scheduler
                </h5>
                <p className="text-slate-600 dark:text-slate-300">
                  Create a task in Windows Task Scheduler set to trigger <strong>At Startup</strong>, running <code>pythonw.exe agent.py</code> silently in the background.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY PAYLOAD */}
          {activeTab === 'payload' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                  Telemetry Payload & Metrics Schema
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  The agent sends an HTTP `POST` JSON payload every 15 seconds to <code>/api/servers/report/</code> authenticated via `token` header:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <Cpu className="w-4 h-4 text-blue-500 mb-1" />
                  <div className="text-[11px] font-bold">CPU Metrics</div>
                  <div className="text-[10px] text-slate-400">Usage %, Model, Load 1m/5m/15m</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <HardDrive className="w-4 h-4 text-emerald-500 mb-1" />
                  <div className="text-[11px] font-bold">Memory & Disk</div>
                  <div className="text-[10px] text-slate-400">RAM %, Swap %, Free/Used Disk GB</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <Network className="w-4 h-4 text-purple-500 mb-1" />
                  <div className="text-[11px] font-bold">Network Bandwidth</div>
                  <div className="text-[10px] text-slate-400">Upload & Download KB/s rates</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <Activity className="w-4 h-4 text-amber-500 mb-1" />
                  <div className="text-[11px] font-bold">Services & Top 5</div>
                  <div className="text-[10px] text-slate-400">Nginx, Redis, Gunicorn, Celery</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TROUBLESHOOTING */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                <h5 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Common Troubleshooting Checks
                </h5>
                <ul className="list-disc list-inside space-y-1.5 mt-2">
                  <li><strong>Server Status is OFFLINE:</strong> Verify if `agent.py` is running and `agent_config.json` contains valid `server_id` and `token`.</li>
                  <li><strong>Connection Timeout:</strong> Ensure firewall port 8000 (or your API domain) allows outbound TCP traffic.</li>
                  <li><strong>Check Agent Logs:</strong> Inspect <code>agent.log</code> inside the agent folder for detailed HTTP error codes.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-mono">MonitorDep Agent Documentation v2.4</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  )
}
