import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@core/components/ui/dialog'
import { Button } from '@core/components/ui/button'
import { Label } from '@core/components/ui/label'
import { Input } from '@core/components/ui/input'
import { Textarea } from '@core/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@core/components/ui/select'
import { Settings as SettingsIcon } from 'lucide-react'

interface SettingsProps {
    className?: string
}

export function Settings({ className = '' }: SettingsProps) {
    const [aiProvider, setAiProvider] = useState('openai')
    const [model, setModel] = useState('gpt-3.5-turbo')
    const [apiKey, setApiKey] = useState('')
    const [systemPrompt, setSystemPrompt] = useState('')

    const handleSave = () => {
        // 保存设置到本地存储
        const settings = {
            aiProvider,
            model,
            apiKey,
            systemPrompt,
        }
        localStorage.setItem('settings', JSON.stringify(settings))
    }

    const handleReset = () => {
        // 重置设置
        setAiProvider('openai')
        setModel('gpt-3.5-turbo')
        setApiKey('')
        setSystemPrompt('')
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className={className}>
                    <SettingsIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>设置</DialogTitle>
                    <DialogDescription>
                        配置AI提供商和系统提示词
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>AI 提供商设置</Label>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ai-provider">选择 AI 提供商</Label>
                                <Select value={aiProvider} onValueChange={setAiProvider}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择 AI 提供商" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="model">选择模型</Label>
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择模型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5/GPT-4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="api-key">API Key</Label>
                                <Input
                                    id="api-key"
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="请输入 OpenAI 的 API Key"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>系统提示词设置</Label>
                        <div className="grid gap-2">
                            <Label htmlFor="system-prompt">系统提示词</Label>
                            <Textarea
                                id="system-prompt"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="设置 AI 的角色和行为..."
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        重置更改
                    </Button>
                    <Button onClick={handleSave}>
                        保存设置
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 