'use client'
import React from 'react'
import Image from 'next/image'
import { FaDownload } from 'react-icons/fa'

interface Company {
  id: number | string
  name: string
  domain: string
  logoUrl: string
  downloadCount: number
  isExternal?: boolean
}

export default function CompanyCard({ company }: { company: Company }) {
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
         // Use the new real ID for download tracking
         await fetch(`/api/companies/${saved.id}/download`, { method: 'POST' })
       } catch (e) {
         console.error('Failed to save external company', e)
       }
    } else {
       await fetch(`/api/companies/${company.id}/download`, { method: 'POST' })
    }
    
    // Trigger download
    const link = document.createElement('a')
    link.href = company.logoUrl
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
      <div className="w-32 h-32 relative mb-4">
        <Image 
          src={company.logoUrl} 
          alt={`${company.name} logo`} 
          fill
          className="object-contain"
          unoptimized 
        />
      </div>
      <h3 className="text-lg font-bold mb-1 text-black text-center">{company.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{company.domain}</p>
      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full justify-center cursor-pointer"
      >
        <FaDownload /> Download
      </button>
      <div className="text-xs text-gray-400 mt-2">
        {company.downloadCount} downloads
      </div>
    </div>
  )
}
