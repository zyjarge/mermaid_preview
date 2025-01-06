import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@core/lib/theme/provider'
import { Toaster } from '@core/components/ui/toaster'
import { EditorTabs } from '@web/components/editor-tabs'
import { Preview } from '@web/components/preview'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@core/components/ui/resizable'

import '@/styles/globals.css'

function App() {
    const [code, setCode] = useState('')

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <div className="w-[800px] h-[600px] p-4 flex flex-col">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={50}>
                        <EditorTabs onChange={setCode} />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                        <Preview code={code} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
            <Toaster />
        </ThemeProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)