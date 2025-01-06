import * as React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@core/components/ui/select'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@core/components/ui/card'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Textarea } from '@core/components/ui/textarea'
import { Button } from '@core/components/ui/button'
import { Loader2, Save, RotateCcw } from 'lucide-react'
import type { AIProvider, AIProviderInfo } from '@core/types'
import { getStorageData, setStorageData } from '@core/lib/storage'
import { useToast } from '@core/hooks/use-toast'

interface SettingsProps {
    className?: string
}

const AI_PROVIDERS: AIProviderInfo[] = [
    {
        id: 'openai',
        name: 'OpenAI',
        description: '支持 GPT-3.5/GPT-4',
        models: [
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5' },
            { id: 'gpt-4', name: 'GPT-4' }
        ]
    },
    {
        id: 'claude',
        name: 'Claude',
        description: 'Anthropic Claude',
        models: [
            { id: 'claude-2', name: 'Claude 2' },
            { id: 'claude-instant', name: 'Claude Instant' }
        ]
    },
    {
        id: 'kimi',
        name: 'Kimi',
        description: 'Moonshot AI',
        models: [
            { id: 'moonshot-v1-8k', name: 'Moonshot V1' }
        ]
    },
    {
        id: 'doubao',
        name: '豆包',
        description: 'ByteDance',
        models: [
            { id: 'doubao-v1', name: '豆包 V1' }
        ]
    },
]

interface FormState {
    provider: AIProvider
    apiKey: string
    model: string
    systemPrompt: string
}

export function Settings({ className }: SettingsProps) {
    const { toast } = useToast()
    // 本地状态
    const [formState, setFormState] = React.useState<FormState>({
        provider: 'openai',
        apiKey: '',
        model: '',
        systemPrompt: ''
    })
    const [savedState, setSavedState] = React.useState<FormState | null>(null)
    const [isDirty, setIsDirty] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    // 加载配置
    React.useEffect(() => {
        getStorageData().then((data) => {
            const initialState = {
                provider: data.aiConfig.provider,
                apiKey: data.aiConfig.apiKey,
                model: data.aiConfig.model || '',
                systemPrompt: data.systemPrompt
            }
            setFormState(initialState)
            setSavedState(initialState)
        })
    }, [])

    // 处理表单更改
    const handleProviderChange = (value: AIProvider) => {
        setFormState(prev => ({
            ...prev,
            provider: value,
            model: ''  // 切换提供商时重置模型
        }))
        setIsDirty(true)
    }

    const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormState(prev => ({
            ...prev,
            apiKey: value
        }))
        setIsDirty(true)
    }

    const handleModelChange = (value: string) => {
        setFormState(prev => ({
            ...prev,
            model: value
        }))
        setIsDirty(true)
    }

    const handleSystemPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        setFormState(prev => ({
            ...prev,
            systemPrompt: value
        }))
        setIsDirty(true)
    }

    // 保存所有更改
    const handleSave = async () => {
        try {
            setIsSaving(true)
            await setStorageData({
                aiConfig: {
                    provider: formState.provider,
                    apiKey: formState.apiKey,
                    model: formState.model
                },
                systemPrompt: formState.systemPrompt
            })
            setSavedState(formState)
            setIsDirty(false)
            toast({
                variant: "success",
                title: "保存成功",
                description: "您的设置已成功保存",
                duration: 3000,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "保存失败",
                description: "保存设置时发生错误，请重试",
                duration: 5000,
            })
        } finally {
            setIsSaving(false)
        }
    }

    // 重置更改
    const handleReset = () => {
        if (savedState) {
            setFormState(savedState)
            setIsDirty(false)
            toast({
                description: "已重置为上次保存的设置",
                duration: 2000,
            })
        }
    }

    const currentProvider = AI_PROVIDERS.find(p => p.id === formState.provider)

    return (
        <div className={`p-6 space-y-6 ${className || ''}`}>
            <Card>
                <CardHeader>
                    <CardTitle>AI 提供商设置</CardTitle>
                    <CardDescription>
                        选择 AI 提供商并配置相关参数
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="provider">选择 AI 提供商</Label>
                        <Select
                            value={formState.provider}
                            onValueChange={handleProviderChange}
                            disabled={isSaving}
                        >
                            <SelectTrigger id="provider">
                                <SelectValue placeholder="选择 AI 提供商" />
                            </SelectTrigger>
                            <SelectContent>
                                {AI_PROVIDERS.map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={item.id}
                                    >
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.description}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {currentProvider?.models && (
                        <div className="space-y-2">
                            <Label htmlFor="model">选择模型</Label>
                            <Select
                                value={formState.model}
                                onValueChange={handleModelChange}
                                disabled={isSaving}
                            >
                                <SelectTrigger id="model">
                                    <SelectValue placeholder="选择模型" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentProvider.models.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            value={formState.apiKey}
                            onChange={handleApiKeyChange}
                            placeholder={`请输入 ${currentProvider?.name} 的 API Key`}
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>系统提示词设置</CardTitle>
                    <CardDescription>
                        自定义 AI 的角色和行为
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="systemPrompt">系统提示词</Label>
                        <Textarea
                            id="systemPrompt"
                            value={formState.systemPrompt}
                            onChange={handleSystemPromptChange}
                            placeholder="设置 AI 的角色和行为..."
                            className="min-h-[100px]"
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置更改
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    保存设置
                </Button>
            </div>
        </div>
    )
} 