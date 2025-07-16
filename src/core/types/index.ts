export type Theme = "dark" | "light" | "system"

export type AIProvider = {
    name: string
    apiKey: string
    model: string
    systemPrompt: string
}

// AI配置类型
export interface AIConfig {
  provider: 'kimi' | 'openai' | 'claude' | 'zhipu'
  apiKey: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
  prompt?: string
}

// 默认AI配置
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'kimi',
  apiKey: '',
  baseUrl: 'https://api.moonshot.cn/v1',
  model: 'moonshot-v1-8k',
  temperature: 0.7,
  maxTokens: 1000,
  prompt: '你是一个专业的Mermaid图表修复助手。请分析用户提供的错误的Mermaid代码，找出错误并提供修复后的正确代码。只返回修复后的代码，不要添加额外的解释。'
} 