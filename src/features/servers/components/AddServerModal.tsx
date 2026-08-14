import React from 'react'
import { Sliders, X, ShieldAlert, Check, Copy } from 'lucide-react'

interface AddServerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  addServerProject: string
  setAddServerProject: (val: string) => void
  addServerName: string
  setAddServerName: (val: string) => void
  addServerPublicIp: string
  setAddServerPublicIp: (val: string) => void
  addServerPrivateIp: string
  setAddServerPrivateIp: (val: string) => void
  addServerEnvironment: string
  setAddServerEnvironment: (val: string) => void
  addServerOs: string
  setAddServerOs: (val: string) => void
  justCreatedCredentials: { id: number; token: string; name: string } | null
  copiedId: boolean
  copiedToken: boolean
  copiedAgentCmd: boolean
  copyToClipboard: (text: string, setter: (val: boolean) => void) => void
  setCopiedId: (val: boolean) => void
  setCopiedToken: (val: boolean) => void
  setCopiedAgentCmd: (val: boolean) => void
  API_BASE: string
}

export const AddServerModal: React.FC<AddServerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addServerProject,
  setAddServerProject,
  addServerName,
  setAddServerName,
  addServerPublicIp,
  setAddServerPublicIp,
  addServerPrivateIp,
  setAddServerPrivateIp,
  addServerEnvironment,
  setAddServerEnvironment,
  addServerOs,
  setAddServerOs,
  justCreatedCredentials,
  copiedId,
  copiedToken,
  copiedAgentCmd,
  copyToClipboard,
  setCopiedId,
  setCopiedToken,
  setCopiedAgentCmd,
  API_BASE
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Register New Server Node
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!justCreatedCredentials ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={addServerProject}
                    onChange={(e) => setAddServerProject(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                    placeholder="e.g. King Wins"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Server Name</label>
                  <input
                    type="text"
                    value={addServerName}
                    onChange={(e) => setAddServerName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                    placeholder="e.g. Production Server"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Public IP</label>
                  <input
                    type="text"
                    value={addServerPublicIp}
                    onChange={(e) => setAddServerPublicIp(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="e.g. 13.xxx.xxx.xxx"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Private IP</label>
                  <input
                    type="text"
                    value={addServerPrivateIp}
                    onChange={(e) => setAddServerPrivateIp(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="e.g. 172.xxx.xxx.xxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Environment</label>
                  <select
                    value={addServerEnvironment}
                    onChange={(e) => setAddServerEnvironment(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Operating System</label>
                  <input
                    type="text"
                    value={addServerOs}
                    onChange={(e) => setAddServerOs(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                    placeholder="e.g. Ubuntu 24.04"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex gap-2.5">
                <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Saving will generate a private credentials token. You must configure your Linux host agent with this token for authentication.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30"
                >
                  Save Node
                </button>
              </div>
            </form>
          ) : (
            /* Success Screen displaying Generated credentials ID + Token */
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Server Saved Successfully</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Credentials generated. Copy these keys to your client agent configuration.</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                {/* Server ID */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Server ID</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{justCreatedCredentials.id}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(String(justCreatedCredentials.id), setCopiedId)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Monitoring Token */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col select-all truncate pr-5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Monitoring Token</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate" title={justCreatedCredentials.token}>
                      {justCreatedCredentials.token}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(justCreatedCredentials.token, setCopiedToken)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Run Instruction Command */}
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Run Command on Linux Host:</span>
                <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 relative overflow-hidden group">
                  <button
                    onClick={() => copyToClipboard(`python agent.py ${justCreatedCredentials.id} ${justCreatedCredentials.token} ${API_BASE}`, setCopiedAgentCmd)}
                    className="absolute right-3 top-3 p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-1"
                  >
                    {copiedAgentCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <div className="truncate pr-16">
                    python agent.py {justCreatedCredentials.id} {justCreatedCredentials.token} {API_BASE}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30"
                >
                  Close & Go to Node
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
