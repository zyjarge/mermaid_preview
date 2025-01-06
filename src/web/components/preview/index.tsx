import { useEffect, useRef, forwardRef, useState, useCallback, useLayoutEffect } from 'react'
import { mermaid } from '@core/lib/mermaid'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { ExportButton } from './export-button'

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

            const containerRect = containerRef.current.getBoundingClientRect()
            const svgWidth = svg.viewBox.baseVal.width
            const svgHeight = svg.viewBox.baseVal.height

            const padding = 48
            const availableWidth = containerRect.width - (padding * 2)
            const availableHeight = containerRect.height - (padding * 2)

            // 计算缩放比例
            const scaleX = availableWidth / svgWidth
            const scaleY = availableHeight / svgHeight
            const baseScale = Math.min(scaleX, scaleY)

            // 如果计算出的缩放比例大于 1（100%），则限制为 1
            const newScale = baseScale > 1 ? 1 : baseScale

            setScale(newScale)
            setPosition({ x: 0, y: 0 })
        }, [])

        // 处理滚轮缩放
        const handleWheel = useCallback((e: WheelEvent) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            setScale(s => Math.min(Math.max(0.1, s * delta), 10)) // 增加最大缩放倍数到 10

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
                    // 如果代码为空，显示欢迎信息
                    if (!code.trim()) {
                        actualRef.current!.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div class="text-lg mb-2">欢迎使用 Mermaid 预览工具</div>
                                <div class="text-sm">在左侧编辑器中输入 Mermaid 语法来创建图表</div>
                            </div>
                        `
                        return
                    }

                    const { svg } = await mermaid.render('preview', code)
                    actualRef.current!.innerHTML = svg

                    const svgElement = actualRef.current!.querySelector('svg')
                    if (svgElement) {
                        // 移除任何可能影响尺寸的样式
                        svgElement.style.maxWidth = 'none'
                        svgElement.style.maxHeight = 'none'
                        svgElement.style.width = '100%'
                        svgElement.style.height = '100%'

                        // 确保 SVG 保持其原始宽高比
                        const viewBox = svgElement.viewBox.baseVal
                        const ratio = viewBox.width / viewBox.height
                        if (ratio > 1) {
                            svgElement.style.width = '100%'
                            svgElement.style.height = 'auto'
                        } else {
                            svgElement.style.width = 'auto'
                            svgElement.style.height = '100%'
                        }

                        // 使用 requestAnimationFrame 确保在下一帧重新计算位置
                        requestAnimationFrame(() => {
                            resetView()
                        })
                    }
                } catch (error) {
                    console.error('渲染图表失败:', error)
                    actualRef.current!.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full">
                            <div class="text-red-500 text-lg mb-2">渲染失败</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${error}</div>
                        </div>
                    `
                }
            }

            renderDiagram()
        }, [code, resetView])

        // 使用 useLayoutEffect 来处理尺寸变化
        useLayoutEffect(() => {
            if (!containerRef.current) return;

            const resizeObserver = new ResizeObserver(() => {
                // 使用 requestAnimationFrame 确保在下一帧重新计算位置
                requestAnimationFrame(() => {
                    resetView();
                });
            });

            resizeObserver.observe(containerRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }, [resetView]);

        return (
            <div className={`h-full flex flex-col isolate ${className}`}>
                {/* 控制栏 */}
                <div className="flex justify-between items-center p-2 border-b dark:border-gray-700 relative z-10">
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
                        <ExportButton previewRef={actualRef} />
                    </div>
                </div>
                {/* 预览区域 */}
                <div
                    ref={containerRef}
                    className="flex-1 relative flex items-center justify-center overflow-hidden p-6 isolate"
                    style={{
                        contain: 'layout size paint',
                        minHeight: 0,
                        position: 'relative',
                        willChange: 'transform'
                    }}
                >
                    <div
                        ref={actualRef}
                        className={`w-full h-full flex items-center justify-center ${isDragging ? 'cursor-grabbing' : isZooming ? 'cursor-zoom-in' : 'cursor-grab'}`}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s',
                            position: 'absolute',
                            inset: 0,
                            willChange: 'transform'
                        }}
                        onMouseDown={handleMouseDown}
                        onDoubleClick={handleDoubleClick}
                    />
                </div>
            </div>
        )
    }
) 