import { AIService, AIProvider } from './types'
import { KimiAIService } from './kimi'
import { AIConfig } from '@core/types'

export class AIServiceFactory {
    private static instance: AIServiceFactory
    private services: Map<AIProvider, AIService>

    private constructor() {
        this.services = new Map()
    }

    static getInstance(): AIServiceFactory {
        if (!AIServiceFactory.instance) {
            AIServiceFactory.instance = new AIServiceFactory()
        }
        return AIServiceFactory.instance
    }

    registerService(provider: AIProvider, config: AIConfig | string): void {
        switch (provider) {
            case 'kimi':
                if (typeof config === 'string') {
                    // 向后兼容：支持只传入apiKey的情况
                    this.services.set(provider, new KimiAIService(config))
                } else {
                    this.services.set(provider, new KimiAIService({
                        apiKey: config.apiKey,
                        baseUrl: config.baseUrl,
                        model: config.model,
                        temperature: config.temperature,
                        maxTokens: config.maxTokens
                    }))
                }
                break
            // TODO: 其他AI服务提供商的实现
            case 'openai':
                // TODO: 实现OpenAI服务
                throw new Error('OpenAI服务暂未实现')
            case 'claude':
                // TODO: 实现Claude服务
                throw new Error('Claude服务暂未实现')
            case 'zhipu':
                // TODO: 实现智谱AI服务
                throw new Error('智谱AI服务暂未实现')
            default:
                throw new Error(`不支持的AI提供商: ${provider}`)
        }
    }

    getService(provider: AIProvider): AIService {
        const service = this.services.get(provider)
        if (!service) {
            throw new Error(`AI服务未初始化: ${provider}`)
        }
        return service
    }
} 