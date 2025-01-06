import * as React from 'react'
import { Loader2, Send, Bot, User } from 'lucide-react'
import { AIServiceFactory } from '@core/lib/ai/factory'
import { useToast } from '@hooks/use-toast'
import { ChatMessage } from '@core/lib/ai/types'
import { Button } from '@components/ui/button'
import { Textarea } from '@components/ui/textarea'
import { ScrollArea } from '@components/ui/scroll-area'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"

interface AIExplanationProps {
    code: string
    className?: string
}

// 示例聊天数据
const EXAMPLE_MESSAGES: ChatMessage[] = [
    {
        role: 'system',
        content: '你是一个专业的图表解释助手，擅长分析和解释 Mermaid 图表。',
        timestamp: Date.now() - 5000
    },
    {
        role: 'user',
        content: '请帮我分析这个图表的含义：\n```mermaid\nsequenceDiagram\n    Client->>Server: POST /explain\n    Server->>AIProvider: 获取API Key\n    AIProvider-->>Server: 返回API Key\n    Server->>AIProvider: 发送AI请求\n    AIProvider-->>Server: 返回解释结果\n    Server-->>Client: 返回成功响应 (200 OK)\n```',
        timestamp: Date.now() - 4000
    },
    {
        role: 'assistant',
        content: '这个序列图展示了一个典型的 AI 解释服务的请求流程：\n\n1. 首先，客户端向服务器发送一个 POST 请求到 /explain 端点\n2. 服务器需要与 AI 提供商通信，所以先获取必要的 API Key\n3. AI 提供商返回 API Key 给服务器\n4. 服务器使用获得的 Key 发送 AI 请求\n5. AI 提供商处理请求并返回解释结果\n6. 最后，服务器将结果包装后返回给客户端，状态码为 200 表示成功\n\n这是一个标准的三方系统交互流程，确保了安全性（通过 API Key）和可靠性（通过状态码）。',
        timestamp: Date.now() - 3000
    },
    {
        role: 'user',
        content: '这个图表中的 AIProvider 具体是指什么？',
        timestamp: Date.now() - 2000
    },
    {
        role: 'assistant',
        content: 'AIProvider 在这个图表中代表 AI 服务提供商，比如：\n\n1. Kimi (Moonshot AI)\n2. OpenAI\n3. Claude (Anthropic)\n4. 智谱 AI\n\n这些提供商都提供了强大的 API 接口，可以处理自然语言理解和生成任务。在这个系统中，我们主要使用它们来解析和理解 Mermaid 图表的含义。\n\n每个提供商都需要 API Key 来进行身份验证和访问控制，这就是为什么图表中显示了获取 API Key 的步骤。',
        timestamp: Date.now() - 1000
    }
]

export function AIExplanation({ code, className }: AIExplanationProps) {
    const [messages, setMessages] = React.useState<ChatMessage[]>(EXAMPLE_MESSAGES)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string>('')
    const [input, setInput] = React.useState('')
    const { toast } = useToast()
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // 自动滚动到底部
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // 初始化 AI 服务
    React.useEffect(() => {
        const apiKey = import.meta.env.VITE_KIMI_API_KEY
        if (!apiKey) {
            setError('未配置 Kimi API Key')
            return
        }

        try {
            AIServiceFactory.getInstance().registerService('kimi', apiKey)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'AI 服务初始化失败'
            setError(errorMessage)
            toast({
                title: "初始化失败",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }, [toast])

    const handleChat = async (chatMessages: ChatMessage[]) => {
        try {
            setLoading(true)
            setError('')

            const aiService = AIServiceFactory.getInstance().getService('kimi')
            const response = await aiService.chat(chatMessages)

            setMessages(prev => [...prev, ...chatMessages, response.message])
            setInput('')

            toast({
                title: "回复成功",
                description: "AI 已生成回复",
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '请求失败，请重试'
            setError(errorMessage)
            toast({
                title: "请求失败",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSend = () => {
        if (!input.trim() || loading) return

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        }

        handleChat([...messages, userMessage])
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Card className={`h-full flex flex-col ${className || ''}`}>
            <CardHeader className="border-b px-4 py-2 bg-gray-50 dark:bg-gray-900">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI 助手
                </CardTitle>
                <CardDescription>
                    我可以帮你分析和解释 Mermaid 图表
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea ref={scrollRef} className="h-full">
                    <div className="space-y-4 p-4">
                        {messages.map((message, index) => (
                            message.role !== 'system' && (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                                        }`}
                                >
                                    <Avatar className={message.role === 'assistant' ? 'mt-4' : 'mt-4'}>
                                        <AvatarFallback>
                                            {message.role === 'assistant' ? (
                                                <Bot className="h-5 w-5" />
                                            ) : (
                                                <User className="h-5 w-5" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`flex flex-col gap-2 ${message.role === 'assistant' ? 'items-start' : 'items-end'
                                            }`}
                                    >
                                        <div
                                            className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'assistant'
                                                ? 'bg-muted'
                                                : 'bg-primary text-primary-foreground'
                                                }`}
                                        >
                                            <div className="prose prose-sm dark:prose-invert">
                                                {message.content.split('\n').map((line, i) => (
                                                    <p key={i} className="m-0">
                                                        {line}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground px-4">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            )
                        ))}
                        {loading && (
                            <div className="flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {error && (
                            <div className="flex justify-center">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
                <div className="flex gap-2 w-full">
                    <Textarea
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入消息..."
                        className="resize-none"
                        rows={1}
                        disabled={loading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}