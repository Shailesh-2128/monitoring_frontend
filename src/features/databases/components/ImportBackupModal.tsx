import React, { useState } from 'react'
import { X, Upload, Database as DatabaseIcon, AlertTriangle, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { Database } from '../../../types/database'

interface ImportBackupModalProps {
  isOpen: boolean
  onClose: () => void
  database: Database | null
  apiBase: string
  token: string | null
  onImportSuccess?: () => void
}

export const ImportBackupModal: React.FC<ImportBackupModalProps> = ({
  isOpen,
  onClose,
  database,
  apiBase,
  token,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [progressStatus, setProgressStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<any | null>(null)

  if (!isOpen || !database) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.name.endsWith('.sql') && !file.name.endsWith('.txt')) {
        setError('Please select a valid .sql backup file.')
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setError(null)
      setSuccessResult(null)
      setProgress(0)
      setProgressStatus('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select an SQL backup file to import.')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccessResult(null)
    setProgress(5)
    setProgressStatus('Initializing SQL backup upload...')

    const formData = new FormData()
    formData.append('file', selectedFile)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${apiBase}/api/databases/${database.id}/import-backup/`, true)

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    // Upload progress event
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        // Map upload bytes to 5% -> 60% progress
        const percentComplete = Math.round((event.loaded / event.total) * 55) + 5
        setProgress(percentComplete)
        const loadedMb = (event.loaded / (1024 * 1024)).toFixed(2)
        const totalMb = (event.total / (1024 * 1024)).toFixed(2)
        setProgressStatus(`Uploading SQL Backup payload (${loadedMb} MB / ${totalMb} MB)...`)
      }
    };

    // When upload completes, switch to query execution state (60% -> 98%)
    xhr.upload.onload = () => {
      setProgress(60)
      setProgressStatus('Executing SQL DDL schema & inserting table data rows...')
    }

    // Smooth execution progress interval
    const executionTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          return 98
        }
        return prev + 2
      })
    }, 250)

    xhr.onload = () => {
      clearInterval(executionTimer)
      setIsUploading(false)

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          setProgress(100)
          setProgressStatus('SQL Backup successfully restored to database!')
          setSuccessResult(data)
          if (onImportSuccess) {
            onImportSuccess()
          }
        } catch (parseErr) {
          setError('Failed to parse backend response.')
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText)
          setError(errData.error || 'Failed to import SQL backup file.')
        } catch (e) {
          setError(`HTTP Error ${xhr.status}: Failed to import SQL backup file.`)
        }
        setProgress(0)
      }
    }

    xhr.onerror = () => {
      clearInterval(executionTimer)
      setIsUploading(false)
      setProgress(0)
      setError('Network connection error while uploading SQL backup.')
    }

    xhr.send(formData)
  }

  const handleModalClose = () => {
    if (isUploading) return
    setSelectedFile(null)
    setError(null)
    setSuccessResult(null)
    setProgress(0)
    setProgressStatus('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Import SQL Backup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore schema and table records to target database
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target DB Specs */}
        <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block font-mono">
                {database.project}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{database.name}</span>
              <span className="text-slate-400 ml-1.5 font-mono">({database.db_type})</span>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {database.host}:{database.port}
          </div>
        </div>

        {/* Warning Banner */}
        {!isUploading && !successResult && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong className="font-semibold">Notice:</strong> Importing an SQL backup will execute statement queries directly against <span className="font-semibold">{database.name}</span>.
            </p>
          </div>
        )}

        {/* Dynamic Progress Bar during Import */}
        {isUploading && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progressStatus}
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/30"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isUploading && !successResult && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Backup File (.sql)
              </label>
              
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-5 transition-colors flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/30 group">
                <input
                  type="file"
                  accept=".sql,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={isUploading}
                />
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click or drag & drop backup <span className="text-indigo-600 dark:text-indigo-400">.sql</span> file here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports PostgreSQL & MySQL standard dump scripts</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successResult && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <p className="font-bold">{successResult.message}</p>
                {successResult.details && (
                  <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    Successfully executed {successResult.details.executed_statements} of {successResult.details.total_statements} SQL query statements into target database.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 text-xs text-rose-700 dark:text-rose-300 font-mono">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              disabled={isUploading}
            >
              {successResult ? 'Close' : 'Cancel'}
            </button>
            
            {!successResult && (
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Execute SQL Backup</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
