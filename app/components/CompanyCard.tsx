'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { FaDownload, FaImage, FaAppStore, FaGlobe, FaRulerCombined } from 'react-icons/fa'

interface Company {
  id: number | string
  name: string
  domain: string
  logoUrl: string
  downloadCount: number
  isExternal?: boolean
  resolutions?: Record<string, string>
  source?: string
  type?: 'logo' | 'favicon'
}

export default function CompanyCard({ company }: { company: Company }) {
  const [imgSrc, setImgSrc] = useState(company.logoUrl)
  const [imgError, setImgError] = useState(false)
  const [selectedResolution, setSelectedResolution] = useState(company.resolutions ? Object.keys(company.resolutions).pop() : 'Original')
  const [dimensions, setDimensions] = useState<{w: number, h: number} | null>(null)

  const getDownloadUrl = () => {
    if (company.resolutions && selectedResolution && company.resolutions[selectedResolution]) {
        return company.resolutions[selectedResolution]
    }
    return imgSrc
  }

  const handleDownload = async () => {
    const downloadUrl = getDownloadUrl()
    
    // If external, save it to DB first (best effort)
    if (company.isExternal) {
       try {
         const res = await fetch('/api/companies', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(company)
         })
         const saved = await res.json()
         const downloadId = saved.id || company.id
         await fetch(`/api/companies/${downloadId}/download`, { method: 'POST' })
       } catch (e) {
         console.error('Failed to save external company', e)
       }
    } else {
       await fetch(`/api/companies/${company.id}/download`, { method: 'POST' })
    }
    
    const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(company.name + '-logo.png')}`
    
    const link = document.createElement('a')
    link.href = proxyUrl
    link.download = `${company.name}-logo.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getSourceIcon = () => {
      if (company.source === 'AppStore') return <FaAppStore className="text-blue-500" />
      if (company.source === 'Clearbit' || company.source === 'Google') return <FaGlobe className="text-gray-400" />
      return null
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center hover:border-blue-500 hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      {company.isExternal && (
         <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md text-[10px] font-medium text-gray-500">
           {getSourceIcon()} {company.source || 'Global'}
         </div>
      )}
      
      <div className="w-full aspect-square relative mb-4 flex items-center justify-center bg-gray-50/50 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
        {!imgError ? (
          <Image 
            src={imgSrc} 
            alt={`${company.name} logo`} 
            fill
            className="object-contain p-4"
            unoptimized 
            onLoadingComplete={(img) => {
                setDimensions({ w: img.naturalWidth, h: img.naturalHeight })
            }}
            onError={() => {
              if (imgSrc.includes('clearbit')) {
                setImgSrc(`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${company.domain}&size=256`)
              } else {
                setImgError(true)
              }
            }}
          />
        ) : (
          <div className="text-gray-300 flex flex-col items-center justify-center h-full w-full">
            <FaImage size={24} />
            <span className="text-xs mt-2 font-medium">No Preview</span>
          </div>
        )}
      </div>

      <div className="w-full text-center mb-3">
        <h3 className="text-base font-bold text-gray-900 truncate">{company.name}</h3>
        <p className="text-xs text-gray-500 truncate mt-0.5">{company.domain}</p>
      </div>
      
      <div className="w-full space-y-2 mt-auto">
        {/* Dimensions Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 py-1 rounded">
            <FaRulerCombined size={10} />
            {dimensions ? `${dimensions.w} x ${dimensions.h}px` : 'Checking size...'}
        </div>

        {company.resolutions && (
            <select 
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="w-full text-xs py-1.5 px-2 border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:border-blue-500"
            >
                {Object.keys(company.resolutions).map(res => (
                    <option key={res} value={res}>{res}</option>
                ))}
            </select>
        )}

        <button 
            onClick={handleDownload}
            disabled={imgError}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                imgError 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
        >
            <FaDownload size={10} /> Download PNG
        </button>
      </div>
    </div>
  )
}
