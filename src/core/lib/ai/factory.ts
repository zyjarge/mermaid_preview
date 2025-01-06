import { AIService, AIProvider } from './types'
import { KimiAIService } from './kimi'

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

    registerService(provider: AIProvider, apiKey: string): void {
        switch (provider) {
            case 'kimi':
                this.services.set(provider, new KimiAIService(apiKey))
                break
            // 其他AI服务提供商的实现将在后续添加
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