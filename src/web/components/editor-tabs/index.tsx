import * as React from 'react'
import { Editor } from '../editor'
import { AIExplanation } from '../ai-explanation'
import { Settings } from '../settings'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../core/components/ui/tabs'

const DEFAULT_MERMAID_CODE = `graph TD
    A[打开工具] --> B[选择使用模式]
    B -->|Web模式| C[访问网页版]
    B -->|插件模式| D[使用Chrome插件]
    
    C --> E[编辑器界面]
    D --> E
    
    E --> F[输入Mermaid语法]
    F --> G{实时预览}
    
    G -->|成功| H[图表操作]
    G -->|失败| I[查看错误提示]
    I --> F
    
    H --> J[缩放图表]
    H --> K[拖拽位置]
    H --> L[重置视图]
    
    J --> M[导出图表]
    K --> M
    L --> M
    
    M --> N{选择格式}
    N -->|PNG| O[透明背景]
    N -->|JPG| P[白色背景]
    N -->|PDF| Q[保持比例]
    
    O --> R[下载文件]
    P --> R
    Q --> R
    
    style A fill:#d0f4de
    style G fill:#fcf6bd
    style N fill:#fcf6bd
    style R fill:#ffd6e0`

export interface EditorTabsProps {
    onChange?: (code: string) => void
}

export function EditorTabs({ onChange }: EditorTabsProps) {
    const [code, setCode] = React.useState(DEFAULT_MERMAID_CODE)

    React.useEffect(() => {
        // 初始化时触发一次 onChange，确保默认代码能够被预览
        onChange?.(DEFAULT_MERMAID_CODE)
    }, [onChange])

    const handleCodeChange = (newCode: string) => {
        setCode(newCode)
        onChange?.(newCode)
    }

    return (
        <Tabs defaultValue="editor" className="w-full h-full">
            <TabsList className="flex w-full">
                <TabsTrigger value="editor" className="flex-1">编辑器</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1">AI 解释</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">设置</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="h-[calc(100%-40px)]">
                <Editor code={code} onChange={handleCodeChange} />
            </TabsContent>
            <TabsContent value="ai">
                <AIExplanation code={code} />
            </TabsContent>
            <TabsContent value="settings">
                <Settings />
            </TabsContent>
        </Tabs>
    )
} 