import React, { useEffect, useRef, useState } from 'react'
import { render } from '@core/lib/mermaid'
import { cn } from '@core/lib/utils'
import { useToast } from '@core/components/ui/use-toast'
import { ZoomControls } from '@core/components/shared/zoom-controls'
import { ExportButtons } from '@core/components/shared/export-buttons'
import type { Theme } from '@core/lib/theme-provider'
import { CodeType } from '@core/lib/code-detector'
import { MarkdownPreview } from '@core/components/markdown-preview'

interface PreviewProps {
    className?: string
    code?: string
    codeType?: CodeType
    onError?: (error: string | null) => void
    showEditor?: boolean
    onToggleEditor?: () => void
}

export function Preview({ className = '', code = '', codeType = 'unknown', onError, showEditor = true, onToggleEditor }: PreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [autoFitScale, setAutoFitScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [theme, setTheme] = useState<Theme>('light')
    const { toast } = useToast()

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'dark' : 'light')
    }, [])

    useEffect(() => {
        if (!code || !containerRef.current) {
            onError?.(null) // 清除错误信息
            return
        }
        if (codeType !== 'mermaid') {
            onError?.(null) // 清除错误信息
            return
        }

        const renderDiagram = async () => {
            try {
                const { svg } = await render('preview-' + Date.now(), code, {
                    theme: theme === 'dark' ? 'dark' : 'default'
                })
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg
                    const svgElement = containerRef.current.querySelector('svg')
                    if (svgElement) {
                        svgElement.style.background = 'transparent'
                        
                        // 计算自适应缩放比例
                        const calculateAutoFitScale = () => {
                            const parent = containerRef.current?.parentElement
                            if (!parent || !svgElement) return 1
                            
                            const parentRect = parent.getBoundingClientRect()
                            const svgRect = svgElement.getBoundingClientRect()
                            
                            // 减去一些边距以避免滚动条
                            const availableWidth = parentRect.width - 20
                            const availableHeight = parentRect.height - 20
                            
                            const scaleX = availableWidth / svgRect.width
                            const scaleY = availableHeight / svgRect.height
                            
                            // 使用较小的缩放比例以确保完全显示，移除100%限制
                            return Math.min(scaleX, scaleY)
                        }
                        
                        // 延迟计算以确保DOM已更新
                        setTimeout(() => {
                            const autoScale = calculateAutoFitScale()
                            setAutoFitScale(autoScale)
                            setScale(autoScale)
                            
                            // 计算居中位置
                            const parent = containerRef.current?.parentElement
                            if (parent && svgElement) {
                                const parentRect = parent.getBoundingClientRect()
                                const svgRect = svgElement.getBoundingClientRect()
                                
                                const scaledWidth = svgRect.width * autoScale
                                const scaledHeight = svgRect.height * autoScale
                                
                                const centerX = (parentRect.width - scaledWidth) / 2
                                const centerY = (parentRect.height - scaledHeight) / 2
                                
                                setPosition({ x: centerX, y: centerY })
                            } else {
                                setPosition({ x: 0, y: 0 })
                            }
                        }, 100)
                    }
                }
                // 渲染成功，清除错误信息
                onError?.(null)
            } catch (error) {
                console.error('Failed to render diagram:', error)
                // 优先使用原始错误信息，如果没有则使用 message
                let errorMsg = '图表语法可能有误，请检查后重试'
                
                if (error instanceof Error) {
                    // 检查是否有原始错误信息（来自我们的增强错误）
                    const originalMessage = (error as any).originalMessage
                    if (originalMessage) {
                        errorMsg = originalMessage
                        console.log('Using original error message:', errorMsg)
                    } else {
                        errorMsg = error.message || error.toString()
                        console.log('Using error message:', errorMsg)
                    }
                }
                
                // 将错误信息传递给父组件
                onError?.(errorMsg)
                
                // 在预览区域显示简化的错误信息
                if (containerRef.current) {
                    containerRef.current.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
                                <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-destructive/20 rounded-full">
                                    <svg class="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 class="text-lg font-semibold text-destructive mb-2">语法错误</h3>
                                <p class="text-sm text-muted-foreground">Mermaid 代码存在语法错误，请检查代码框下方的详细错误信息</p>
                            </div>
                        </div>
                    `
                }
            }
        }

        renderDiagram()
    }, [code, theme, toast, codeType, onError])

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme)
    }

    const handleZoomIn = () => {
        setScale(prev => Math.min(10, prev * 1.2))
        setPosition({ x: 0, y: 0 })
    }

    const handleZoomOut = () => {
        setScale(prev => Math.max(0.25, prev / 1.2))
        setPosition({ x: 0, y: 0 })
    }

    const handleReset = () => {
        setScale(autoFitScale)
        
        // 重置时也需要重新计算居中位置
        if (containerRef.current) {
            const parent = containerRef.current.parentElement
            const svgElement = containerRef.current.querySelector('svg')
            
            if (parent && svgElement) {
                const parentRect = parent.getBoundingClientRect()
                const svgRect = svgElement.getBoundingClientRect()
                
                const scaledWidth = svgRect.width * autoFitScale
                const scaledHeight = svgRect.height * autoFitScale
                
                const centerX = (parentRect.width - scaledWidth) / 2
                const centerY = (parentRect.height - scaledHeight) / 2
                
                setPosition({ x: centerX, y: centerY })
            } else {
                setPosition({ x: 0, y: 0 })
            }
        }
    }

    const handleWheel = (e: React.WheelEvent) => {
        if (codeType === 'markdown') return
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const newScale = Math.max(0.25, Math.min(10, scale * delta))
        const scaleChange = newScale / scale

        const newX = position.x - (mouseX * (scaleChange - 1))
        const newY = position.y - (mouseY * (scaleChange - 1))

        setScale(newScale)
        setPosition({ x: newX, y: newY })
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (codeType === 'markdown') return
        e.preventDefault()
        setIsDragging(true)
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || codeType === 'markdown') return
        e.preventDefault()
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    return (
        <div className={cn('relative flex flex-col h-full bg-background border-l', className)}>
            <div className="flex items-center justify-between p-2 border-b">
                <ZoomControls
                    scale={scale}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onReset={handleReset}
                    showEditor={showEditor}
                    onToggleEditor={onToggleEditor}
                />
                <ExportButtons 
                    targetRef={containerRef}
                    onThemeChange={handleThemeChange}
                    codeType={codeType}
                    code={code}
                />
            </div>
            <div
                className="flex-1 relative overflow-auto"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: codeType === 'mermaid' ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                {codeType === 'markdown' ? (
                    <MarkdownPreview code={code} />
                ) : (
                    <div
                        ref={containerRef}
                        className="absolute"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                            transition: isDragging ? 'none' : 'transform 0.1s'
                        }}
                    />
                )}
            </div>
        </div>
    )
} 