'use client'
import React, { useEffect, useState } from 'react'

type Metrics = {
  searchSuccessRate: number
  totalDownloads: number
  totalCompanies: number
  totalSearches: number
}

export default function KPIDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    fetch('/api/metrics').then(res => res.json()).then(setMetrics)
  }, [])

  if (!metrics) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm text-blue-600 font-semibold">Success Rate</div>
        <div className="text-2xl font-bold text-black">{metrics.searchSuccessRate}%</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-sm text-green-600 font-semibold">Total Downloads</div>
        <div className="text-2xl font-bold text-black">{metrics.totalDownloads}</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-sm text-purple-600 font-semibold">Logos Available</div>
        <div className="text-2xl font-bold text-black">{metrics.totalCompanies}</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="text-sm text-orange-600 font-semibold">Total Searches</div>
        <div className="text-2xl font-bold text-black">{metrics.totalSearches}</div>
      </div>
    </div>
  )
}
