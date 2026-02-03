"use client"

import { useState } from 'react'

interface LogoImageProps {
    logoUrl: string
    fallbackUrl: string
    companyName: string
}

export default function LogoImage({ logoUrl, fallbackUrl, companyName }: LogoImageProps) {
    const [src, setSrc] = useState(logoUrl)

    return (
        <img
            src={src}
            alt={`${companyName} logo - Official company logo`}
            className="max-w-[300px] max-h-[300px] object-contain"
            onError={() => setSrc(fallbackUrl)}
        />
    )
}
