import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs'
import { Card } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Settings } from '@core/components/settings'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { noctisLilac } from 'thememirror'
import { Bot } from 'lucide-react'
import type { Theme } from '@core/lib/theme-provider'
import { CodeDetector } from '@core/lib/code-detector'
import type { CodeType } from '../../lib/code-detector'
import { useToast } from '@core/components/ui/use-toast'
import { getStorageData } from '@core/lib/storage'
import { AIConfig, DEFAULT_AI_CONFIG } from '@core/types'
import { AIServiceFactory } from '@core/lib/ai/factory'

interface EditorTabsProps {
    onChange?: (value: string, type: CodeType) => void
    className?: string
    defaultValue?: string
    onFixError?: (fixedCode: string) => void
    onError?: (error: string | null) => void
}

const DEFAULT_CODE = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`

export function EditorTabs({ onChange, className = '', defaultValue = DEFAULT_CODE, onFixError, onError }: EditorTabsProps) {
    const [code, setCode] = useState(defaultValue)
    const [codeType, setCodeType] = useState<CodeType>('markdown')
    const [theme, setTheme] = useState<Theme>('light')
    const [isFixing, setIsFixing] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        // 初始化时触发一次 onChange，并检测代码类型
        const type = CodeDetector.detect(code)
        setCodeType(type)
        onChange?.(code, type)
    }, []) // 仅在组件挂载时执行一次

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'dark' : 'light')

        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark')
                    setTheme(isDark ? 'dark' : 'light')
                }
            })
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    const handleChange = (value: string) => {
        setCode(value)
        const type = CodeDetector.detect(value)
        setCodeType(type)
        onChange?.(value, type)
        
        // 清除之前的错误信息
        onError?.(null)
    }

    // AI修复功能
    const handleAIFix = async () => {
        if (!code.trim()) {
            toast({
                title: '请输入代码',
                description: '需要代码内容才能进行AI修复',
                variant: 'destructive'
            })
            return
        }

        if (codeType !== 'mermaid') {
            toast({
                title: '仅支持Mermaid代码修复',
                description: '当前仅支持对Mermaid图表代码进行AI修复',
                variant: 'destructive'
            })
            return
        }

        setIsFixing(true)
        try {
            // 获取AI配置
            const storageData = await getStorageData()
            const aiConfig: AIConfig = { ...DEFAULT_AI_CONFIG, ...storageData.aiConfig }
            
            if (!aiConfig.apiKey) {
                toast({
                    title: '请配置API Key',
                    description: '请在设置中配置AI服务的API Key',
                    variant: 'destructive'
                })
                return
            }

            // 初始化AI服务
            const aiFactory = AIServiceFactory.getInstance()
            aiFactory.registerService(aiConfig.provider, aiConfig)
            const aiService = aiFactory.getService(aiConfig.provider)

            // 构造修复提示
            const systemMessage = {
                role: 'system' as const,
                content: aiConfig.prompt || DEFAULT_AI_CONFIG.prompt!,
                timestamp: Date.now()
            }

            const userMessage = {
                role: 'user' as const,
                content: `请修复以下Mermaid代码中的错误：\n\n${code}`,
                timestamp: Date.now()
            }

            // 调用AI服务
            const response = await aiService.chat([systemMessage, userMessage])
            const fixedCode = response.message.content

            // 提取代码块（如果AI返回的是包含代码块的内容）
            const codeBlockMatch = fixedCode.match(/```(?:mermaid)?\n([\s\S]*?)\n```/)
            const extractedCode = codeBlockMatch ? codeBlockMatch[1] : fixedCode

            // 更新代码
            const trimmedCode = extractedCode.trim()
            if (trimmedCode) {
                setCode(trimmedCode)
                const type = CodeDetector.detect(trimmedCode)
                setCodeType(type)
                onChange?.(trimmedCode, type)
                onFixError?.(trimmedCode)
                onError?.(null) // 清除错误信息
                
                toast({
                    title: 'AI修复完成',
                    description: '代码已修复，请查看结果'
                })
            } else {
                toast({
                    title: 'AI修复失败',
                    description: '未能获取有效的修复代码',
                    variant: 'destructive'
                })
            }
        } catch (error) {
            console.error('AI修复失败:', error)
            toast({
                title: 'AI修复失败',
                description: error instanceof Error ? error.message : '未知错误',
                variant: 'destructive'
            })
        } finally {
            setIsFixing(false)
        }
    }

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <Tabs defaultValue="editor" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="editor">编辑器</TabsTrigger>
                    <TabsTrigger value="settings">设置</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="flex-1 flex flex-col p-0">
                    <div className="flex-1">
                        <CodeMirror
                            value={code}
                            height="100%"
                            extensions={[markdown()]}
                            theme={theme === 'dark' ? oneDark : noctisLilac}
                            onChange={handleChange}
                            className="h-full"
                        />
                    </div>
                    {/* AI修复按钮 */}
                    <div className="p-3 border-t bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-indigo-950/30">
                        <Button 
                            onClick={handleAIFix}
                            disabled={isFixing}
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {isFixing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    AI智能修复中...
                                </>
                            ) : (
                                <>
                                    <Bot className="mr-2 h-4 w-4" />
                                    ✨ AI智能修复
                                </>
                            )}
                        </Button>
                        <div className="mt-2 text-center">
                            <span className="text-xs text-muted-foreground">
                                智能检测语法错误并自动修复
                            </span>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="settings" className="flex-1 p-0">
                    <Settings />
                </TabsContent>
            </Tabs>
        </Card>
    )
} 