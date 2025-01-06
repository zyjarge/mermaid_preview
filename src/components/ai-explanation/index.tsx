import * as React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { apiClient } from '@/api/client'

interface AIExplanationProps {
    code: string
    className?: string
}

export function AIExplanation({ code, className }: AIExplanationProps) {
    const [explanation, setExplanation] = React.useState<string>('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string>('')

    const analyzeCode = React.useCallback(async () => {
        if (!code.trim()) {
            setExplanation('请先输入 Mermaid 图表代码...')
            return
        }

        try {
            setLoading(true)
            setError('')
            const response = await apiClient.analyzeDiagram(code)
            setExplanation(response.explanation)
        } catch (err) {
            setError(err instanceof Error ? err.message : '解析失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }, [code])

    return (
        <div className={`h-full flex flex-col ${className || ''}`}>
            <div className="border-b px-4 py-2 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI 解释结果
                </h2>
                <button
                    onClick={analyzeCode}
                    disabled={loading}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    title="重新解释"
                >
                    <RefreshCw className={`h-4 w-4 text-gray-700 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                ) : (
                    <div className="p-4 overflow-auto h-full">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {!explanation ? (
                                <p className="text-sm text-muted-foreground">
                                    点击右上角的刷新按钮获取 AI 解释...
                                </p>
                            ) : (
                                explanation.split('\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 