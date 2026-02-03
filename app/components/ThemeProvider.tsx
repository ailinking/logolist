'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    resolvedTheme: 'light' | 'dark'
    setTheme: (theme: Theme) => void
    mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
    const context = useContext(ThemeContext)
    // Return safe defaults if used outside provider (during SSR/static generation)
    if (!context) {
        return {
            theme: 'system' as Theme,
            resolvedTheme: 'light' as const,
            setTheme: () => { },
            mounted: false
        }
    }
    return context
}

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>('system')
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    // Get system preference
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'light'
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            setThemeState(stored)
        }
        setMounted(true)
    }, [])

    // Update resolved theme and apply to document
    useEffect(() => {
        if (!mounted) return

        const resolved = theme === 'system' ? getSystemTheme() : theme
        setResolvedTheme(resolved)

        // Apply theme to document
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(resolved)
        document.documentElement.setAttribute('data-theme', resolved)

        // Update meta theme-color for browser UI
        const metaTheme = document.querySelector('meta[name="theme-color"]')
        if (metaTheme) {
            metaTheme.setAttribute('content', resolved === 'dark' ? '#0a0a0a' : '#ffffff')
        }
    }, [theme, mounted])

    // Listen for system theme changes
    useEffect(() => {
        if (!mounted) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = () => {
            if (theme === 'system') {
                const resolved = getSystemTheme()
                setResolvedTheme(resolved)
                document.documentElement.classList.remove('light', 'dark')
                document.documentElement.classList.add(resolved)
                document.documentElement.setAttribute('data-theme', resolved)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme, mounted])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem('theme', newTheme)
    }

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    )
}
