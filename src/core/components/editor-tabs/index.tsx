import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs'
import { Card } from '@core/components/ui/card'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { noctisLilac } from 'thememirror'
import type { Theme } from '@core/lib/theme-provider'
import { CodeDetector } from '@core/lib/code-detector'
import type { CodeType } from '../../lib/code-detector'

interface EditorTabsProps {
    onChange?: (value: string, type: CodeType) => void
    className?: string
    defaultValue?: string
}

const DEFAULT_CODE = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`

export function EditorTabs({ onChange, className = '', defaultValue = DEFAULT_CODE }: EditorTabsProps) {
    const [code, setCode] = useState(defaultValue)
    const [codeType, setCodeType] = useState<CodeType>('markdown')
    const [theme, setTheme] = useState<Theme>('light')

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

    useEffect(() => {
        console.log(codeType); // 示例用法，实际应根据业务需求使用
    }, [codeType])

    const handleChange = (value: string) => {
        setCode(value)
        const type = CodeDetector.detect(value)
        setCodeType(type)
        onChange?.(value, type)
    }

    const handleTabClick = (type: CodeType) => {
        setCodeType(type)
        onChange?.(code, type)
    }

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <Tabs defaultValue="editor" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="editor">编辑器</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="flex-1 p-0">
                    <CodeMirror
                        value={code}
                        height="100%"
                        extensions={[markdown()]}
                        theme={theme === 'dark' ? oneDark : noctisLilac}
                        onChange={handleChange}
                        className="h-full"
                    />
                </TabsContent>
                <TabsContent value="examples" className="flex-1 p-4 overflow-auto">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">示例图表</h3>
                        <p className="text-sm text-muted-foreground">
                            点击示例代码将自动复制到编辑器中。
                        </p>
                        {/* TODO: Add example diagrams */}
                    </div>
                </TabsContent>
            </Tabs>
            <div>
                <button onClick={() => handleTabClick('markdown')}>
                    Switch to markdown
                </button>
            </div>
        </Card>
    )
} 