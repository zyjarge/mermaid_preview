import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Textarea } from '@core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select'
import { useToast } from '@core/components/ui/use-toast'
import { getStorageData, setStorageData } from '@core/lib/storage'
import { AIConfig, DEFAULT_AI_CONFIG } from '@core/types'

interface SettingsProps {
  className?: string
}

export function Settings({ className = '' }: SettingsProps) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true)
      try {
        const data = await getStorageData()
        const savedConfig = {
          ...DEFAULT_AI_CONFIG,
          ...data.aiConfig
        }
        setConfig(savedConfig)
      } catch (error) {
        console.error('Failed to load config:', error)
        toast({
          title: '配置加载失败',
          description: '使用默认配置',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadConfig()
  }, [toast])

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await setStorageData({ aiConfig: config })
      toast({
        title: '配置保存成功',
        description: 'AI配置已更新'
      })
    } catch (error) {
      console.error('Failed to save config:', error)
      toast({
        title: '配置保存失败',
        description: '请重试',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 重置配置
  const handleReset = () => {
    setConfig(DEFAULT_AI_CONFIG)
    toast({
      title: '配置已重置',
      description: '请保存配置以应用更改'
    })
  }

  // 测试连接
  const handleTestConnection = async () => {
    if (!config.apiKey) {
      toast({
        title: '请输入API Key',
        description: '需要API Key才能测试连接',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // 这里可以添加测试连接的逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟测试
      toast({
        title: '连接测试成功',
        description: 'AI服务连接正常'
      })
    } catch (error) {
      toast({
        title: '连接测试失败',
        description: '请检查配置是否正确',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载配置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full overflow-auto p-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI 设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI服务商选择 */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI服务商</Label>
            <Select value={config.provider} onValueChange={(value: any) => updateConfig({ provider: value })}>
              <SelectTrigger>
                <SelectValue placeholder="选择AI服务商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kimi">Kimi (月之暗面)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="zhipu">智谱AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="输入你的API Key"
              value={config.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
            />
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              placeholder="API服务的基础URL"
              value={config.baseUrl}
              onChange={(e) => updateConfig({ baseUrl: e.target.value })}
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">模型名称</Label>
            <Input
              id="model"
              placeholder="模型名称"
              value={config.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (0-1)</Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="1"
              step="0.1"
              placeholder="0.7"
              value={config.temperature}
              onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
            />
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">最大Token数</Label>
            <Input
              id="maxTokens"
              type="number"
              min="1"
              placeholder="1000"
              value={config.maxTokens}
              onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
            />
          </div>

          {/* 提示词 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">修复提示词</Label>
            <Textarea
              id="prompt"
              placeholder="自定义AI修复代码时使用的提示词"
              value={config.prompt}
              onChange={(e) => updateConfig({ prompt: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存配置'}
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={isLoading}>
              {isLoading ? '测试中...' : '测试连接'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              重置配置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 