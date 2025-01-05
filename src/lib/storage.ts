import type { AIProvider } from '@/types'

export interface AIConfig {
    provider: AIProvider
    apiKey: string
    model?: string
}

export interface StorageData {
    aiConfig: AIConfig
    systemPrompt: string
}

const defaultConfig: StorageData = {
    aiConfig: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo'
    },
    systemPrompt: '你是一位经验丰富的软件工程专家，精通各类图表和流程图的设计与解读。请帮助用户理解和分析 Mermaid 图表的内容，用通俗易懂的语言解释图表的结构、关系和核心信息。'
}

export async function getStorageData(): Promise<StorageData> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['aiConfig', 'systemPrompt'], (result) => {
            resolve({
                aiConfig: result.aiConfig || defaultConfig.aiConfig,
                systemPrompt: result.systemPrompt || defaultConfig.systemPrompt
            })
        })
    })
}

export async function setStorageData(data: Partial<StorageData>): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve)
    })
}

export async function clearStorageData(): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.clear(resolve)
    })
} 