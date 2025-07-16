import { AIConfig } from '@core/types'

// 存储键名前缀
const STORAGE_PREFIX = 'mermaid_preview_'

// 存储数据类型
export interface StorageData {
  apiProvider?: string
  apiKey?: string
  theme?: string
  aiConfig?: AIConfig
  [key: string]: any
}

// 获取完整的存储键名
const getStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`

// 获取存储数据
export async function getStorageData(): Promise<StorageData> {
  try {
    // 如果是浏览器环境
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(getStorageKey('settings'))
      return data ? JSON.parse(data) : {}
    }
    
    // 如果是扩展环境
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(null, (items) => {
          resolve(items || {})
        })
      })
    }
    
    return {}
  } catch (error) {
    console.error('Failed to get storage data:', error)
    return {}
  }
}

// 设置存储数据
export async function setStorageData(data: Partial<StorageData>): Promise<void> {
  try {
    // 如果是浏览器环境
    if (typeof window !== 'undefined') {
      const existingData = await getStorageData()
      const newData = { ...existingData, ...data }
      localStorage.setItem(getStorageKey('settings'), JSON.stringify(newData))
      return
    }
    
    // 如果是扩展环境
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.set(data, () => {
          resolve()
        })
      })
    }
  } catch (error) {
    console.error('Failed to set storage data:', error)
    throw error
  }
}

// 清除存储数据
export async function clearStorageData(): Promise<void> {
  try {
    // 如果是浏览器环境
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey('settings'))
      return
    }
    
    // 如果是扩展环境
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.clear(() => {
          resolve()
        })
      })
    }
  } catch (error) {
    console.error('Failed to clear storage data:', error)
    throw error
  }
} 