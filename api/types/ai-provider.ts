export type AIProvider = 'zhipu' | 'openai' | 'anthropic'

export interface AIProviderConfig {
    provider: AIProvider
    apiKey: string
    model?: string
    baseURL?: string
}

export interface AIMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface AIRequestOptions {
    temperature?: number
    maxTokens?: number
    topP?: number
}

export interface AIResponse {
    content: string
}

export interface AIClient {
    analyze(prompt: string, options?: AIRequestOptions): Promise<AIResponse>
} 