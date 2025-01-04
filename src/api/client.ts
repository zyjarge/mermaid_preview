import type { AnalyzeRequest, AnalyzeResponse } from './types'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

class ApiClient {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
        }

        return response.json()
    }

    async analyzeDiagram(code: string): Promise<AnalyzeResponse> {
        return this.request<AnalyzeResponse>('/analyze', {
            method: 'POST',
            body: JSON.stringify({ code } as AnalyzeRequest),
        })
    }
}

export const apiClient = new ApiClient() 