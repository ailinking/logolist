import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://logolist.vercel.app'),
  title: {
    default: 'LogoList - Download Free Company Logos in PNG, SVG & Vector Formats',
    template: '%s | LogoList'
  },
  description: 'Download high-quality company logos and brand assets for free. Get official logos from 1000+ brands including Apple, Google, Nike, Stripe in PNG, SVG, and vector formats.',
  keywords: [
    'company logos',
    'brand logos',
    'logo download',
    'free logos',
    'logo PNG',
    'logo SVG',
    'vector logos',
    'brand assets',
    'company logo download',
    'tech company logos',
    'startup logos'
  ],
  authors: [{ name: 'LogoList' }],
  creator: 'LogoList',
  publisher: 'LogoList',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://logolist.vercel.app',
    siteName: 'LogoList',
    title: 'LogoList - Download Free Company Logos in PNG, SVG & Vector Formats',
    description: 'Download high-quality company logos and brand assets for free. Get official logos from 1000+ brands in PNG, SVG, and vector formats.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LogoList - Free Company Logo Downloads',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogoList - Download Free Company Logos',
    description: 'Download high-quality company logos and brand assets for free. 1000+ brands in PNG, SVG, and vector formats.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://logolist.vercel.app',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip link for keyboard users - WCAG 2.4.1 */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
