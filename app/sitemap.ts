import { MetadataRoute } from 'next'
import { CURATED_CATEGORIES, TOP_100_COMPANIES } from '@/lib/curatedData'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://logolist.vercel.app'

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ]

    // Category pages
    const categories = Object.keys(CURATED_CATEGORIES)
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${baseUrl}/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    }))

    // Individual logo pages from all curated companies
    const allCompanies = new Map<string, { name: string; domain: string }>()

    // Add all companies from categories
    Object.values(CURATED_CATEGORIES).forEach((companies) => {
        companies.forEach((company) => {
            const slug = company.domain.replace(/\./g, '-').toLowerCase()
            allCompanies.set(slug, company)
        })
    })

    // Add top 100 companies
    TOP_100_COMPANIES.forEach((company) => {
        const slug = company.domain.replace(/\./g, '-').toLowerCase()
        allCompanies.set(slug, company)
    })

    const logoPages: MetadataRoute.Sitemap = Array.from(allCompanies.entries()).map(
        ([slug]) => ({
            url: `${baseUrl}/logo/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        })
    )

    return [...staticPages, ...categoryPages, ...logoPages]
}
