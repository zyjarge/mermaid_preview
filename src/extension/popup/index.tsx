import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@core/lib/theme-provider'
import { Preview } from '@core/components/preview'
import { EditorTabs } from '@core/components/editor-tabs'
import { Toaster } from '@core/components/ui/toaster'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@core/components/ui/resizable'

import '@core/styles/globals.css'

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="container mx-auto p-4">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={50}>
                        <EditorTabs />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                        <Preview />
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