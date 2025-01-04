import { useEffect, useRef, forwardRef, useState, useCallback } from 'react'
import { mermaid } from '@/lib/mermaid'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface PreviewProps {
    code: string
    className?: string
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(
    ({ code, className }, ref) => {
        const innerRef = useRef<HTMLDivElement>(null)
        const containerRef = useRef<HTMLDivElement>(null)
        const actualRef = (ref as React.RefObject<HTMLDivElement>) || innerRef
        const [scale, setScale] = useState(1)
        const [position, setPosition] = useState({ x: 0, y: 0 })
        const [isDragging, setIsDragging] = useState(false)
        const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
        const [isZooming, setIsZooming] = useState(false)
        const zoomTimeout = useRef<number>()

        // 重置视图并自动适配大小
        const resetView = useCallback(() => {
            if (!actualRef.current || !containerRef.current) return

            const svg = actualRef.current.querySelector('svg')
            if (!svg) return

            const containerWidth = containerRef.current.clientWidth - 32
            const containerHeight = containerRef.current.clientHeight - 32
            const svgWidth = svg.viewBox.baseVal.width
            const svgHeight = svg.viewBox.baseVal.height

            const scaleX = containerWidth / svgWidth
            const scaleY = containerHeight / svgHeight
            const newScale = Math.min(scaleX, scaleY, 1)

            setScale(newScale)
            setPosition({ x: 0, y: 0 })
        }, [])

        // 处理滚轮缩放
        const handleWheel = useCallback((e: WheelEvent) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            setScale(s => Math.min(Math.max(0.1, s * delta), 5))

            // 设置缩放状态
            setIsZooming(true)
            // 清除之前的定时器
            if (zoomTimeout.current) {
                window.clearTimeout(zoomTimeout.current)
            }
            // 设置新的定时器，300ms 后重置缩放状态
            zoomTimeout.current = window.setTimeout(() => {
                setIsZooming(false)
            }, 300)
        }, [])

        // 处理拖拽开始
        const handleMouseDown = useCallback((e: React.MouseEvent) => {
            setIsDragging(true)
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            })
        }, [position])

        // 处理拖拽
        const handleMouseMove = useCallback((e: MouseEvent) => {
            if (!isDragging) return
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            })
        }, [isDragging, dragStart])

        // 处理拖拽结束
        const handleMouseUp = useCallback(() => {
            setIsDragging(false)
        }, [])

        // 处理双击
        const handleDoubleClick = useCallback(() => {
            resetView()
        }, [resetView])

        // 缩放控制
        const handleZoom = useCallback((delta: number) => {
            setScale(s => Math.min(Math.max(0.1, s * delta), 5))
        }, [])

        // 清理定时器
        useEffect(() => {
            return () => {
                if (zoomTimeout.current) {
                    window.clearTimeout(zoomTimeout.current)
                }
            }
        }, [])

        // 添加事件监听
        useEffect(() => {
            const element = actualRef.current
            if (!element) return

            element.addEventListener('wheel', handleWheel, { passive: false })
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                element.removeEventListener('wheel', handleWheel)
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }, [handleWheel, handleMouseMove, handleMouseUp])

        useEffect(() => {
            if (!actualRef.current) return

            const renderDiagram = async () => {
                try {
                    actualRef.current!.innerHTML = ''
                    const { svg } = await mermaid.render('preview', code)
                    actualRef.current!.innerHTML = svg

                    const svgElement = actualRef.current!.querySelector('svg')
                    if (svgElement) {
                        svgElement.style.maxWidth = '100%'
                        svgElement.style.height = 'auto'
                        resetView()
                    }
                } catch (error) {
                    console.error('渲染图表失败:', error)
                    actualRef.current!.innerHTML = `<div class="text-red-500">渲染失败: ${error}</div>`
                }
            }

            renderDiagram()
        }, [code, resetView])

        return (
            <div className={`h-full flex flex-col ${className}`}>
                {/* 控制栏 */}
                <div className="flex justify-between items-center p-2 border-b dark:border-gray-700">
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200">
                        {Math.round(scale * 100)}%
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleZoom(1.1)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            title="放大"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleZoom(0.9)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            title="缩小"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={resetView}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                            title="重置视图"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* 预览区域 */}
                <div ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
                    <div
                        ref={actualRef}
                        className={`w-full h-full p-4 ${isDragging ? 'cursor-grabbing' : isZooming ? 'cursor-zoom-in' : 'cursor-grab'}`}
                        onMouseDown={handleMouseDown}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s'
                        }}
                    />
                </div>
            </div>
        )
    }
) 