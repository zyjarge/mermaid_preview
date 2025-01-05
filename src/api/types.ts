// API 响应类型
export interface ApiResponse<T = any> {
    code: number
    msg: string
    data: T
}

// 智谱AI响应类型
export interface ZhipuResponse {
    code: number
    msg: string
    data: {
        choices: {
            message: {
                content: string
            }
        }[]
    }
}

// 分析请求类型
export interface AnalyzeRequest {
    code: string
}

// 分析响应类型
export interface AnalyzeResponse {
    explanation: string
} 