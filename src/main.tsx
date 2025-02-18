import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Preview } from '@core/components/preview'
import { EditorTabs } from '@core/components/editor-tabs'
import { ThemeProvider } from '@core/components/ui/theme-provider'
// import { Settings } from '@core/components/settings'
import { Toaster } from '@core/components/ui/toaster'
import '@core/styles/globals.css'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@core/components/ui/resizable'
import { CodeType } from './core/lib/code-detector'

function App() {
    const [code, setCode] = useState(`graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`)
    const [codeType, setCodeType] = useState<CodeType>('mermaid')

    const handleCodeChange = (value: string, type: CodeType) => {
        setCode(value)
        setCodeType(type)
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background">
                <div className="flex h-screen">
                    <div className="flex-1 flex flex-col">
                        <ResizablePanelGroup direction="horizontal" className="flex-1">
                            <ResizablePanel defaultSize={30}>
                                <EditorTabs className="h-full" onChange={handleCodeChange} />
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={70}>
                                <Preview className="h-full" code={code} codeType={codeType} />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </div>
                <Toaster />
            </div>
        </ThemeProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
) 