import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CURATED_CATEGORIES, TOP_100_COMPANIES } from '@/lib/curatedData'
import LogoImage from '@/app/components/LogoImage'

// Generate all possible company slugs for static generation
export async function generateStaticParams() {
    const allCompanies = new Map<string, { name: string; domain: string }>()

    Object.values(CURATED_CATEGORIES).forEach((companies) => {
        companies.forEach((company) => {
            const slug = company.domain.replace(/\./g, '-').toLowerCase()
            allCompanies.set(slug, company)
        })
    })

    TOP_100_COMPANIES.forEach((company) => {
        const slug = company.domain.replace(/\./g, '-').toLowerCase()
        allCompanies.set(slug, company)
    })

    return Array.from(allCompanies.keys()).map((slug) => ({ slug }))
}

// Helper to find company by slug
function getCompanyBySlug(slug: string) {
    const allCompanies: { name: string; domain: string; category?: string }[] = []

    Object.entries(CURATED_CATEGORIES).forEach(([category, companies]) => {
        companies.forEach((company) => {
            allCompanies.push({ ...company, category })
        })
    })

    return allCompanies.find(
        (c) => c.domain.replace(/\./g, '-').toLowerCase() === slug
    )
}

// Get related companies from same category
function getRelatedCompanies(category: string, currentDomain: string) {
    const companies = CURATED_CATEGORIES[category] || []
    return companies
        .filter((c) => c.domain !== currentDomain)
        .slice(0, 8)
}

// Dynamic metadata for SEO
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const company = getCompanyBySlug(slug)

    if (!company) {
        return {
            title: 'Logo Not Found',
            description: 'The requested logo could not be found.',
        }
    }

    const title = `${company.name} Logo - Download PNG, SVG & Vector`
    const description = `Download the official ${company.name} logo in high-quality PNG, SVG, and vector formats. Free ${company.name} logo for presentations, design projects, and brand assets.`

    return {
        title,
        description,
        keywords: [
            `${company.name} logo`,
            `${company.name} logo PNG`,
            `${company.name} logo SVG`,
            `${company.name} logo download`,
            `${company.name} logo vector`,
            `${company.name} brand`,
            `${company.name} icon`,
            'company logo',
            'brand logo',
            'logo download'
        ],
        openGraph: {
            title,
            description,
            url: `https://logolist.vercel.app/logo/${slug}`,
            siteName: 'LogoList',
            images: [
                {
                    url: `https://logo.clearbit.com/${company.domain}`,
                    width: 200,
                    height: 200,
                    alt: `${company.name} Logo`,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images: [`https://logo.clearbit.com/${company.domain}`],
        },
        alternates: {
            canonical: `https://logolist.vercel.app/logo/${slug}`,
        },
    }
}

export default async function LogoPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const company = getCompanyBySlug(slug)

    if (!company) {
        notFound()
    }

    const logoUrl = `https://logo.clearbit.com/${company.domain}`
    const faviconUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${company.domain}&size=256`
    const relatedCompanies = company.category
        ? getRelatedCompanies(company.category, company.domain)
        : []

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: `${company.name} Logo`,
        description: `Official logo of ${company.name}`,
        contentUrl: logoUrl,
        thumbnailUrl: logoUrl,
        encodingFormat: 'image/png',
        acquireLicensePage: `https://${company.domain}`,
        copyrightHolder: {
            '@type': 'Organization',
            name: company.name,
            url: `https://${company.domain}`,
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            Logo<span className="text-blue-600">List</span>
                        </Link>
                        <nav className="flex gap-4 text-sm">
                            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                            <Link href="/category/ai" className="text-gray-600 hover:text-gray-900">AI</Link>
                            <Link href="/category/saas" className="text-gray-600 hover:text-gray-900">SaaS</Link>
                            <Link href="/category/fintech" className="text-gray-600 hover:text-gray-900">Fintech</Link>
                        </nav>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-12">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-gray-900">Home</Link>
                        <span className="mx-2">/</span>
                        {company.category && (
                            <>
                                <Link
                                    href={`/category/${company.category}`}
                                    className="hover:text-gray-900 capitalize"
                                >
                                    {company.category}
                                </Link>
                                <span className="mx-2">/</span>
                            </>
                        )}
                        <span className="text-gray-900">{company.name} Logo</span>
                    </nav>

                    {/* Main Content */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Logo Display */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex items-center justify-center">
                            <LogoImage
                                logoUrl={logoUrl}
                                fallbackUrl={faviconUrl}
                                companyName={company.name}
                            />
                        </div>

                        {/* Logo Info & Downloads */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {company.name} Logo
                            </h1>

                            <p className="text-lg text-gray-600 mb-8">
                                Download the official {company.name} logo in high-quality formats.
                                This logo is the intellectual property of {company.name} and should
                                be used in accordance with their brand guidelines.
                            </p>

                            <div className="space-y-4 mb-8">
                                <h2 className="text-xl font-semibold text-gray-900">Download Formats</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <a
                                        href={logoUrl}
                                        download={`${company.name.toLowerCase().replace(/\s+/g, '-')}-logo.png`}
                                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        PNG Format
                                    </a>

                                    <a
                                        href={faviconUrl}
                                        download={`${company.name.toLowerCase().replace(/\s+/g, '-')}-icon.png`}
                                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Icon/Favicon
                                    </a>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">Logo Information</h3>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Company</dt>
                                        <dd className="text-gray-900 font-medium">{company.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Website</dt>
                                        <dd>
                                            <a
                                                href={`https://${company.domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {company.domain}
                                            </a>
                                        </dd>
                                    </div>
                                    {company.category && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Category</dt>
                                            <dd className="text-gray-900 capitalize">{company.category}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* SEO Content Section */}
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            About {company.name} Logo
                        </h2>
                        <div className="prose prose-gray max-w-none">
                            <p>
                                The {company.name} logo is a distinctive visual representation of the brand,
                                used across their digital platforms, marketing materials, and products.
                                This logo is available for download in PNG format, suitable for presentations,
                                documents, and design mockups.
                            </p>
                            <p>
                                When using the {company.name} logo, please ensure you follow their official
                                brand guidelines. The logo should not be modified, distorted, or used in ways
                                that could misrepresent the brand. For official brand assets and guidelines,
                                please visit <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                                    {company.domain}
                                </a>.
                            </p>
                        </div>
                    </section>

                    {/* Related Logos */}
                    {relatedCompanies.length > 0 && (
                        <section className="mt-16">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Related {company.category?.toUpperCase()} Logos
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                                {relatedCompanies.map((related) => (
                                    <Link
                                        key={related.domain}
                                        href={`/logo/${related.domain.replace(/\./g, '-').toLowerCase()}`}
                                        className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition flex flex-col items-center gap-2"
                                    >
                                        <img
                                            src={`https://logo.clearbit.com/${related.domain}`}
                                            alt={`${related.name} logo`}
                                            className="w-12 h-12 object-contain"
                                        />
                                        <span className="text-xs text-gray-600 text-center truncate w-full">
                                            {related.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-12 mt-16">
                    <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} LogoList. All logos are property of their respective owners.</p>
                        <div className="mt-4 flex justify-center gap-6">
                            <Link href="/" className="hover:text-gray-900">Home</Link>
                            <Link href="/category/ai" className="hover:text-gray-900">AI Logos</Link>
                            <Link href="/category/saas" className="hover:text-gray-900">SaaS Logos</Link>
                            <Link href="/category/fintech" className="hover:text-gray-900">Fintech Logos</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
