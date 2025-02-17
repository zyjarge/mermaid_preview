export type Theme = "dark" | "light" | "system"

export type AIProvider = {
    name: string
    apiKey: string
    model: string
    systemPrompt: string
} 