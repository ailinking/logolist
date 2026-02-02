"use client"

import { useState, useEffect } from "react"

type ChangeLog = {
  id: number
  action: string
  entityType: string
  entityId: number
  changes: string
  createdAt: string
  adminUser?: {
    username: string
  }
  company?: {
    name: string
  }
}

export default function ChangeHistory() {
  const [logs, setLogs] = useState<ChangeLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/history')
      .then(res => res.json())
      .then(data => {
        if (data.logs) {
            setLogs(data.logs)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div className="px-4 py-6 sm:px-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Change History</h2>
        <div className="mt-4 flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {logs.map((log) => (
              <li key={log.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                  <h3 className="text-sm font-semibold text-gray-800">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {log.action} on {log.entityType} {log.company?.name || `#${log.entityId}`}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{log.changes}</p>
                  <div className="mt-2 flex items-center justify-between">
                     <p className="text-xs text-gray-500">
                        by {log.adminUser?.username || 'System'}
                     </p>
                     <p className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                     </p>
                  </div>
                </div>
              </li>
            ))}
            {logs.length === 0 && (
                <li className="py-5 text-center text-gray-500">No history found</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
