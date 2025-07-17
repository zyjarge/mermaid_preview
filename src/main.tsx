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
import { CodeDetector } from './core/lib/code-detector'
import { parseError, formatErrorDisplay } from './core/lib/error-parser'

function App() {
    const [code, setCode] = useState(`graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`)
    const [codeType, setCodeType] = useState<CodeType>('mermaid')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleCodeChange = (value: string, type: CodeType) => {
        setCode(value)
        setCodeType(type)
    }

    const handleFixError = (fixedCode: string) => {
        setCode(fixedCode)
        const type = CodeDetector.detect(fixedCode)
        setCodeType(type)
    }

    const handleError = (error: string | null) => {
        setErrorMessage(error)
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background">
                <div className="flex h-screen">
                    <div className="flex-1 flex flex-col">
                        <ResizablePanelGroup direction="horizontal" className="flex-1">
                            <ResizablePanel defaultSize={30} className="flex flex-col">
                                <EditorTabs className="flex-1" onChange={handleCodeChange} onFixError={handleFixError} onError={handleError} />
                                {errorMessage && (() => {
                                    const parsedError = parseError(errorMessage)
                                    const errorDisplay = formatErrorDisplay(parsedError, code)
                                    
                                    return (
                                        <div className="border-t border-destructive/20 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20 p-4 text-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 w-5 h-5 text-destructive flex-shrink-0">
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-destructive mb-2 flex items-center gap-2">
                                                        {errorDisplay.title}
                                                        <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive/80 rounded-full font-normal">Mermaid</span>
                                                        {errorDisplay.lineNumber && (
                                                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-normal">
                                                                第 {errorDisplay.lineNumber} 行
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="text-xs text-foreground/80 mb-2">
                                                        {errorDisplay.description}
                                                    </div>
                                                    
                                                    {errorDisplay.codeSnippet && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-muted-foreground mb-1">错误代码行：</div>
                                                            <div className="text-xs font-mono bg-background/60 border border-border/50 rounded-md p-2 break-all whitespace-pre-wrap">
                                                                <span className="text-muted-foreground mr-2">{errorDisplay.lineNumber}:</span>
                                                                <span className="bg-destructive/20 text-destructive px-1 rounded">{errorDisplay.codeSnippet}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                            查看完整错误信息
                                                        </summary>
                                                        <div className="text-xs text-foreground/70 font-mono bg-background/60 border border-border/50 rounded-md p-2 mt-1 break-all whitespace-pre-wrap max-h-20 overflow-y-auto">
                                                            {errorMessage}
                                                        </div>
                                                    </details>
                                                    
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        💡 提示：请检查语法是否符合 Mermaid 规范，或使用 AI 智能修复功能
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={70}>
                                <Preview className="h-full" code={code} codeType={codeType} onError={handleError} />
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