import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import type { ThemeToggleProps } from '@/types'

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, onThemeChange }) => {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        onThemeChange?.(newTheme)
    }

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${className || ''}`}
            title={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
        </button>
    )
} 