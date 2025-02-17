import type { AIProvider } from '@core/types'

export function saveSettings(settings: AIProvider) {
    localStorage.setItem('settings', JSON.stringify(settings))
}

export function loadSettings(): AIProvider | null {
    const settings = localStorage.getItem('settings')
    if (!settings) return null
    return JSON.parse(settings)
}

export function clearSettings() {
    localStorage.removeItem('settings')
} 