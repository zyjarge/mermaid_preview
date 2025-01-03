import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/globals.css'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Editor } from '@/components/editor'
import { Preview } from '@/components/preview'
import { ThemeProvider } from '@/lib/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { ExportButtons } from '@/components/export-buttons'

const defaultCode = `graph TD
    A[开始] --> B{判断}
    B -->|Yes| C[执行]
    B -->|No| D[结束]
    C --> D`

const Popup = () => {
    const [code, setCode] = useState(defaultCode)
    const previewRef = useRef<HTMLDivElement>(null)

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="border-b p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Mermaid Preview</h1>
                    <div className="flex items-center gap-4">
                        <ExportButtons previewRef={previewRef} />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4">
                <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full rounded-lg border bg-white dark:bg-gray-800"
                >
                    <ResizablePanel defaultSize={50}>
                        <Editor value={code} onChange={setCode} className="h-full" />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                        <Preview ref={previewRef} code={code} className="h-full" />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
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