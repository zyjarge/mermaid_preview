import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '@/styles/themes/light.css'
import '@/styles/themes/dark.css'
import '@/styles/globals.css'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
    Editor,
    Preview,
    ThemeToggle,
    ExportButtons
} from '@/components'
import { ThemeProvider } from '@/lib/theme-provider'
import { GitBranch } from 'lucide-react'

const defaultCode = `graph TD
    A[开始] --> B{判断}
    B -->|Yes| C[执行]
    B -->|No| D[结束]
    C --> D`

const Popup = () => {
    const [code, setCode] = useState(defaultCode)
    const previewRef = useRef<HTMLDivElement>(null)

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="border-b bg-white dark:bg-gray-900">
                <div className="w-full">
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center space-x-4">
                            <GitBranch className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Mermaid Preview
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ExportButtons previewRef={previewRef} />
                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full bg-white dark:bg-gray-800"
                >
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full flex flex-col">
                            <div className="border-b px-4 py-2 bg-gray-50 dark:bg-gray-900">
                                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    编辑器
                                </h2>
                            </div>
                            <Editor value={code} onChange={setCode} className="flex-1" />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <Preview ref={previewRef} code={code} className="h-full" />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
            <footer className="border-t bg-white dark:bg-gray-900">
                <div className="w-full">
                    <div className="flex h-10 items-center justify-between px-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Mermaid 图表编辑器
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            拖拽移动 · 滚轮缩放 · 双击重置
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="mermaid-preview-theme">
            <Popup />
        </ThemeProvider>
    </React.StrictMode>
) 