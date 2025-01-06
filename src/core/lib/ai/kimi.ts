import { AIService, AIResponse, ChatMessage } from './types'

export class KimiAIService implements AIService {
    private readonly apiKey: string
    private readonly apiEndpoint = 'https://api.moonshot.cn/v1/chat/completions'

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async chat(messages: ChatMessage[]): Promise<AIResponse> {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages: messages.map(({ role, content }) => ({
                    role,
                    content
                })),
                temperature: 0.7,
                max_tokens: 1000
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || '请求失败')
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