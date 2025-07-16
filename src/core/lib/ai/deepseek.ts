import { AIService, AIResponse, ChatMessage } from './types'

interface DeepSeekAIConfig {
    apiKey: string
    baseUrl?: string
    model?: string
    temperature?: number
    maxTokens?: number
}

export class DeepSeekAIService implements AIService {
    private readonly apiKey: string
    private readonly apiEndpoint: string
    private readonly model: string
    private readonly temperature: number
    private readonly maxTokens: number

    constructor(config: DeepSeekAIConfig | string) {
        if (typeof config === 'string') {
            // 向后兼容：支持只传入apiKey的情况
            this.apiKey = config
            this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions'
            this.model = 'deepseek-chat'
            this.temperature = 0.7
            this.maxTokens = 1000
        } else {
            this.apiKey = config.apiKey
            this.apiEndpoint = config.baseUrl 
                ? `${config.baseUrl}/chat/completions`
                : 'https://api.deepseek.com/v1/chat/completions'
            this.model = config.model || 'deepseek-chat'
            this.temperature = config.temperature || 0.7
            this.maxTokens = config.maxTokens || 1000
        }
    }

    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages.map(({ role, content }) => ({
                        role,
                        content
                    })),
                    temperature: this.temperature,
                    max_tokens: this.maxTokens
                })
            })

            if (!response.ok) {
                let errorMessage = `请求失败 (${response.status})`
                try {
                    const error = await response.json()
                    errorMessage = error.error?.message || error.message || errorMessage
                } catch (parseError) {
                    // 如果解析JSON失败，使用默认错误消息
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()
            const content = result.choices?.[0]?.message?.content || '无法生成回复'

            return {
                message: {
                    role: 'assistant',
                    content,
                    timestamp: Date.now()
                }
            }
        } catch (error) {
            console.error('DeepSeek AI服务调用失败:', error)
            throw error
        }
    }

    async analyze(code: string): Promise<{ explanation: string }> {
        const systemMessage: ChatMessage = {
            role: 'system',
            content: '你是一个专业的图表解释助手，擅长分析和解释 Mermaid 图表。请用通俗易懂的语言解释图表的含义和业务流程。',
            timestamp: Date.now()
        }

        const userMessage: ChatMessage = {
            role: 'user',
            content: `请分析并解释以下 Mermaid 图表代码：\n\n${code}`,
            timestamp: Date.now()
        }

        const response = await this.chat([systemMessage, userMessage])
        return { explanation: response.message.content }
    }
} 