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
}

export function Preview({ className = '', code = '', codeType = 'unknown' }: PreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
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
        if (!code || !containerRef.current) return
        if (codeType !== 'mermaid') return

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
                    }
                }
            } catch (error) {
                console.error('Failed to render diagram:', error)
                toast({
                    title: '渲染失败',
                    description: '图表语法可能有误，请检查后重试',
                    variant: 'destructive',
                })
            }
        }

        renderDiagram()
    }, [code, theme, toast, codeType])

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
        setScale(1)
        setPosition({ x: 0, y: 0 })
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