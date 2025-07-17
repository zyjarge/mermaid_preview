import { AlertTriangle, Bot, Copy, X } from 'lucide-react'
import { Button } from '@core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@core/components/ui/dialog'
import { useToast } from '@core/components/ui/use-toast'

interface ErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  error: string
  onAIFix?: () => void
  isFixing?: boolean
}

export function ErrorDialog({ 
  isOpen, 
  onClose, 
  error, 
  onAIFix, 
  isFixing = false 
}: ErrorDialogProps) {
  const { toast } = useToast()

  const handleCopyError = () => {
    navigator.clipboard.writeText(error)
    toast({
      title: '已复制',
      description: '错误信息已复制到剪贴板'
    })
  }

  const parseError = (errorText: string) => {
    // 解析错误信息，提取关键部分
    const lines = errorText.split('\n')
    const errorLine = lines.find(line => line.includes('Error:'))
    const expectingLine = lines.find(line => line.includes('Expecting'))
    
    return {
      main: errorLine || lines[0] || errorText,
      details: expectingLine || '',
      fullError: errorText
    }
  }

  const parsedError = parseError(error)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            语法错误
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 space-y-4 overflow-auto">
          {/* 主要错误信息 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">错误描述</h4>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">
                {parsedError.main}
              </p>
            </div>
          </div>

          {/* 期望的语法 */}
          {parsedError.details && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">期望的语法</h4>
              <div className="p-3 bg-muted/50 border rounded-md">
                <p className="text-sm font-mono break-all">
                  {parsedError.details}
                </p>
              </div>
            </div>
          )}

          {/* 完整错误信息 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">完整错误信息</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyError}
                className="h-8 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                复制
              </Button>
            </div>
            <div className="p-3 bg-muted/30 border rounded-md max-h-32 overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {parsedError.fullError}
              </pre>
            </div>
          </div>

          {/* 修复建议 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">修复建议</h4>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <ul className="text-sm space-y-1">
                <li>• 检查语法是否符合 Mermaid 规范</li>
                <li>• 确保所有节点和连接线的语法正确</li>
                <li>• 检查是否有未闭合的括号或引号</li>
                <li>• 尝试使用 AI 自动修复功能</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isFixing}
          >
            关闭
          </Button>
          {onAIFix && (
            <Button
              onClick={onAIFix}
              disabled={isFixing}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            >
              {isFixing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  AI修复中...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  AI智能修复
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}