import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@core/components/ui/button"
import type { Theme } from "@core/lib/theme-provider"

export interface ThemeToggleProps {
    className?: string
    onThemeChange?: (theme: Theme) => void
}

export function ThemeToggle({ className, onThemeChange }: ThemeToggleProps) {
    const [theme, setTheme] = React.useState<Theme>('dark')

    React.useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        const currentTheme = isDark ? 'dark' : 'light'
        setTheme(currentTheme)
        onThemeChange?.(currentTheme)
    }, [onThemeChange])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.classList.toggle('dark')
        onThemeChange?.(newTheme)
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className={className}
            onClick={toggleTheme}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
} 