'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
    const { setTheme, resolvedTheme, mounted } = useTheme()

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800" aria-hidden="true" />
        )
    }

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] transition-colors duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            {/* Sun icon - shown in dark mode (click to get light) */}
            <svg
                className={`absolute w-5 h-5 transition-all duration-300 ${isDark
                    ? 'opacity-100 rotate-0 scale-100 text-amber-400'
                    : 'opacity-0 rotate-90 scale-50 text-amber-500'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <path
                    strokeLinecap="round"
                    d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                />
            </svg>

            {/* Moon icon - shown in light mode (click to get dark) */}
            <svg
                className={`absolute w-5 h-5 transition-all duration-300 ${!isDark
                    ? 'opacity-100 rotate-0 scale-100 text-gray-600'
                    : 'opacity-0 -rotate-90 scale-50 text-gray-400'
                    }`}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>

            <span className="sr-only">
                {isDark ? 'Currently dark mode. Click to switch to light mode.' : 'Currently light mode. Click to switch to dark mode.'}
            </span>
        </button>
    )
}
