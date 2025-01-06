// AI 提供商类型
export type AIProvider = 'kimi' | 'openai' | 'claude' | 'zhipu'

// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system'

// 聊天消息
export interface ChatMessage {
    role: MessageRole
    content: string
    timestamp: number
}

// AI 请求参数
export interface AIRequestParams {
    messages: ChatMessage[]
    provider: AIProvider
    model?: string
}

// AI 响应结果
export interface AIResponse {
    message: ChatMessage
}

// AI 服务接口
export interface AIService {
    chat(messages: ChatMessage[]): Promise<AIResponse>
    // 为了保持向后兼容，保留原有的 analyze 方法
    analyze(code: string): Promise<{ explanation: string }>
} 