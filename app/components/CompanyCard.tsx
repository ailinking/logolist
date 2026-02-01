'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { FaDownload, FaImage } from 'react-icons/fa'

interface Company {
  id: number | string
  name: string
  domain: string
  logoUrl: string
  downloadCount: number
  isExternal?: boolean
}

export default function CompanyCard({ company }: { company: Company }) {
  const [imgSrc, setImgSrc] = useState(company.logoUrl)
  const [imgError, setImgError] = useState(false)

  const handleDownload = async () => {
    // If external, save it to DB first
    if (company.isExternal) {
       try {
         const res = await fetch('/api/companies', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(company)
         })
         const saved = await res.json()
         // Use the new real ID for download tracking if saved successfully
         const downloadId = saved.id || company.id
         await fetch(`/api/companies/${downloadId}/download`, { method: 'POST' })
       } catch (e) {
         console.error('Failed to save external company', e)
       }
    } else {
       await fetch(`/api/companies/${company.id}/download`, { method: 'POST' })
    }
    
    // Trigger download
    const link = document.createElement('a')
    link.href = imgSrc
    link.download = `${company.name}-logo.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition relative overflow-hidden">
      {company.isExternal && (
         <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl">
           Global
         </div>
      )}
      <div className="w-32 h-32 relative mb-4 flex items-center justify-center bg-gray-50 rounded-lg">
        {!imgError ? (
          <Image 
            src={imgSrc} 
            alt={`${company.name} logo`} 
            fill
            className="object-contain p-2"
            unoptimized 
            onError={() => {
              // Try fallback if primary fails (e.g. clearbit -> google)
              if (imgSrc.includes('clearbit')) {
                setImgSrc(`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${company.domain}&size=256`)
              } else {
                setImgError(true)
              }
            }}
          />
        ) : (
          <div className="text-gray-300 flex flex-col items-center justify-center h-full w-full">
            <FaImage size={32} />
            <span className="text-xs mt-1">No Logo</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold mb-1 text-black text-center truncate w-full">{company.name}</h3>
      <p className="text-sm text-gray-500 mb-4 truncate w-full text-center">{company.domain}</p>
      <button 
        onClick={handleDownload}
        disabled={imgError}
        className={`flex items-center gap-2 text-white px-4 py-2 rounded w-full justify-center cursor-pointer ${imgError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        <FaDownload /> Download
      </button>
      <div className="text-xs text-gray-400 mt-2">
        {company.downloadCount} downloads
      </div>
    </div>
  )
}
