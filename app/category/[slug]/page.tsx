import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CURATED_CATEGORIES } from '@/lib/curatedData'

const CATEGORY_META: Record<string, { title: string; description: string; h1: string }> = {
    ai: {
        title: 'AI Company Logos - Download Artificial Intelligence Brand Logos',
        description: 'Download logos from top AI companies including OpenAI, Anthropic, Midjourney, and more. Free AI company logos in PNG and SVG formats.',
        h1: 'AI & Artificial Intelligence Company Logos'
    },
    saas: {
        title: 'SaaS Company Logos - Download Software as a Service Brand Logos',
        description: 'Download logos from leading SaaS companies including Salesforce, HubSpot, Slack, Zoom, and more. Free SaaS logos in PNG and SVG formats.',
        h1: 'SaaS Company Logos'
    },
    fintech: {
        title: 'Fintech Company Logos - Download Financial Technology Brand Logos',
        description: 'Download logos from top fintech companies including Stripe, PayPal, Square, Coinbase, and more. Free fintech logos in PNG and SVG formats.',
        h1: 'Fintech & Financial Technology Logos'
    },
    social: {
        title: 'Social Media Logos - Download Social Network Brand Logos',
        description: 'Download logos from popular social media platforms including Facebook, Instagram, TikTok, Twitter/X, LinkedIn, and more. Free social media logos.',
        h1: 'Social Media & Network Logos'
    },
    crypto: {
        title: 'Crypto & Blockchain Logos - Download Cryptocurrency Brand Logos',
        description: 'Download logos from top crypto and blockchain companies including Bitcoin, Ethereum, Binance, Coinbase, and more. Free cryptocurrency logos.',
        h1: 'Crypto & Blockchain Company Logos'
    },
    shop: {
        title: 'E-Commerce & Retail Logos - Download Shopping Brand Logos',
        description: 'Download logos from top e-commerce and retail brands including Amazon, Nike, Shopify, Target, and more. Free retail and shopping logos.',
        h1: 'E-Commerce & Retail Brand Logos'
    }
}

export async function generateStaticParams() {
    return Object.keys(CURATED_CATEGORIES).map((slug) => ({ slug }))
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const meta = CATEGORY_META[slug]

    if (!meta) {
        return {
            title: 'Category Not Found',
            description: 'The requested category could not be found.',
        }
    }

    return {
        title: meta.title,
        description: meta.description,
        keywords: [
            `${slug} logos`,
            `${slug} company logos`,
            `${slug} brand logos`,
            'company logos',
            'brand assets',
            'logo download',
            'free logos',
            'logo PNG',
            'logo SVG'
        ],
        openGraph: {
            title: meta.title,
            description: meta.description,
            url: `https://logolist.vercel.app/category/${slug}`,
            siteName: 'LogoList',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: meta.title,
            description: meta.description,
        },
        alternates: {
            canonical: `https://logolist.vercel.app/category/${slug}`,
        },
    }
}

export default async function CategoryPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const companies = CURATED_CATEGORIES[slug]
    const meta = CATEGORY_META[slug]

    if (!companies || !meta) {
        notFound()
    }

    // JSON-LD structured data for category page
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.h1,
        description: meta.description,
        url: `https://logolist.vercel.app/category/${slug}`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: companies.length,
            itemListElement: companies.slice(0, 20).map((company, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Organization',
                    name: company.name,
                    url: `https://${company.domain}`,
                    logo: `https://logo.clearbit.com/${company.domain}`,
                },
            })),
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
                            {Object.keys(CATEGORY_META).map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/category/${cat}`}
                                    className={`capitalize ${cat === slug ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-12">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-gray-900">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 capitalize">{slug} Logos</span>
                    </nav>

                    {/* Hero Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {meta.h1}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl">
                            {meta.description} Browse and download {companies.length} logos from
                            the top {slug.toUpperCase()} companies in PNG and vector formats.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12 flex gap-8">
                        <div>
                            <div className="text-3xl font-bold text-blue-600">{companies.length}</div>
                            <div className="text-sm text-gray-500">Logos Available</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600">Free</div>
                            <div className="text-sm text-gray-500">Download</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-purple-600">PNG/SVG</div>
                            <div className="text-sm text-gray-500">Formats</div>
                        </div>
                    </div>

                    {/* Logo Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {companies.map((company) => (
                            <Link
                                key={company.domain}
                                href={`/logo/${company.domain.replace(/\./g, '-').toLowerCase()}`}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition group"
                            >
                                <div className="aspect-square flex items-center justify-center mb-4">
                                    <img
                                        src={`https://logo.clearbit.com/${company.domain}`}
                                        alt={`${company.name} logo - ${slug} company`}
                                        className="max-w-[80px] max-h-[80px] object-contain group-hover:scale-110 transition"
                                        loading="lazy"
                                    />
                                </div>
                                <h2 className="text-center font-medium text-gray-900 truncate">
                                    {company.name}
                                </h2>
                                <p className="text-center text-xs text-gray-500 mt-1">
                                    {company.domain}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* SEO Content */}
                    <section className="mt-16 prose prose-gray max-w-none">
                        <h2>Download {meta.h1}</h2>
                        <p>
                            LogoList provides free access to high-quality logos from the world&apos;s leading
                            {slug === 'ai' && ' artificial intelligence and machine learning'}
                            {slug === 'saas' && ' software-as-a-service'}
                            {slug === 'fintech' && ' financial technology'}
                            {slug === 'social' && ' social media and networking'}
                            {slug === 'crypto' && ' cryptocurrency and blockchain'}
                            {slug === 'shop' && ' e-commerce and retail'}
                            {' '}companies. Each logo is available for download in PNG format, perfect for
                            presentations, design mockups, and educational purposes.
                        </p>
                        <p>
                            Our collection includes logos from {companies.slice(0, 5).map(c => c.name).join(', ')},
                            and {companies.length - 5} more leading brands in the {slug} industry. All logos are
                            the intellectual property of their respective owners and should be used in accordance
                            with their brand guidelines.
                        </p>

                        <h3>Popular {slug.toUpperCase()} Company Logos</h3>
                        <ul>
                            {companies.slice(0, 10).map((company) => (
                                <li key={company.domain}>
                                    <Link href={`/logo/${company.domain.replace(/\./g, '-').toLowerCase()}`}>
                                        {company.name} Logo
                                    </Link> - Download the official {company.name} logo
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Other Categories */}
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Browse Other Categories
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Object.entries(CATEGORY_META)
                                .filter(([cat]) => cat !== slug)
                                .map(([cat]) => (
                                    <Link
                                        key={cat}
                                        href={`/category/${cat}`}
                                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition text-center"
                                    >
                                        <div className="text-lg font-semibold text-gray-900 capitalize mb-1">
                                            {cat}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {CURATED_CATEGORIES[cat]?.length || 0} logos
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-12 mt-16">
                    <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} LogoList. All logos are property of their respective owners.</p>
                    </div>
                </footer>
            </div>
        </>
    )
}
