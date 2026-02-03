'use client'

import { useTheme } from './ThemeProvider'
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa'

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()

    const cycleTheme = () => {
        const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
        const currentIndex = themes.indexOf(theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        setTheme(nextTheme)
    }

    const getIcon = () => {
        if (theme === 'system') {
            return <FaDesktop size={16} aria-hidden="true" />
        }
        return resolvedTheme === 'dark'
            ? <FaMoon size={16} aria-hidden="true" />
            : <FaSun size={16} aria-hidden="true" />
    }

    const getLabel = () => {
        if (theme === 'system') return 'System theme (following device settings)'
        if (theme === 'dark') return 'Dark theme'
        return 'Light theme'
    }

    const getNextLabel = () => {
        const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
        const currentIndex = themes.indexOf(theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        if (nextTheme === 'system') return 'Switch to system theme'
        if (nextTheme === 'dark') return 'Switch to dark theme'
        return 'Switch to light theme'
    }

    return (
        <button
            onClick={cycleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            aria-label={getNextLabel()}
            aria-live="polite"
            title={getLabel()}
        >
            {getIcon()}
            <span className="sr-only">{getLabel()}</span>
        </button>
    )
}
