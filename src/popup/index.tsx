import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import '@/styles/themes/light.css'
import '@/styles/themes/dark.css'
import '@/styles/globals.css'
import { EditorTabs } from '@/components/editor-tabs'
import { Preview } from '@/components/preview'
import { ThemeProvider } from '@/lib/theme-provider'
import { GitBranch } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

const defaultCode = `graph TD
    A[开始] --> B{判断}
    B -->|Yes| C[执行]
    B -->|No| D[结束]
    C --> D`

const Popup = () => {
    const [code, setCode] = useState(defaultCode)

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
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <EditorTabs value={code} onChange={setCode} />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <Preview code={code} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
            <Toaster />
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