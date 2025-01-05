const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface APIResponse<T = any> {
    code: number
    msg: string
    data?: T
    error?: string
}

interface AnalyzeResponse {
    explanation: string
}

class APIClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    async analyzeDiagram(code: string): Promise<AnalyzeResponse> {
        const response = await fetch(`${this.baseURL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        })

        if (!response.ok) {
            const error = await response.json() as APIResponse
            throw new Error(error.msg || error.error || '请求失败')
        }

        const result = await response.json() as APIResponse<AnalyzeResponse>
        if (result.code !== 200 || !result.data) {
            throw new Error(result.msg || result.error || '解析失败')
        }

        return result.data
    }
}

export const apiClient = new APIClient(API_BASE_URL) 