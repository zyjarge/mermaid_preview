import React from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@core/components/ui/select"
import { Button } from '@core/components/ui/button'
import { Download } from 'lucide-react'
import { useToast } from '@core/hooks/use-toast'

interface ExportButtonProps {
    previewRef: React.RefObject<HTMLDivElement>
}

export function ExportButton({ previewRef }: ExportButtonProps) {
    const { toast } = useToast()

    const handleExport = async (format: string) => {
        if (!previewRef.current) return

        try {
            // 获取当前主题的背景色
            const isDarkMode = document.documentElement.classList.contains('dark')
            const backgroundColor = isDarkMode ? '#020817' : '#ffffff'

            // 找到SVG元素
            const svgElement = previewRef.current.querySelector('svg')
            if (!svgElement) {
                throw new Error('找不到SVG元素')
            }

            // 获取SVG的实际尺寸
            const bbox = svgElement.getBBox()
            const viewBox = svgElement.viewBox.baseVal
            const width = viewBox.width || bbox.width
            const height = viewBox.height || bbox.height

            // 创建一个临时容器
            const container = document.createElement('div')
            container.style.position = 'absolute'
            container.style.left = '-9999px'
            container.style.top = '-9999px'
            container.style.width = `${width}px`
            container.style.height = `${height}px`
            container.style.backgroundColor = format === 'png' ? 'transparent' : backgroundColor
            container.style.display = 'flex'
            container.style.alignItems = 'center'
            container.style.justifyContent = 'center'

            // 克隆SVG并添加到临时容器
            const clonedSvg = svgElement.cloneNode(true) as SVGElement
            // 设置SVG属性以确保正确的尺寸
            clonedSvg.setAttribute('width', width.toString())
            clonedSvg.setAttribute('height', height.toString())
            clonedSvg.style.margin = '0'
            clonedSvg.style.padding = '0'
            clonedSvg.style.display = 'block'

            container.appendChild(clonedSvg)
            document.body.appendChild(container)

            // 使用html2canvas捕获临时容器
            const canvas = await html2canvas(container, {
                backgroundColor: format === 'png' ? null : backgroundColor,
                scale: 2,
                logging: false,
                allowTaint: true,
                useCORS: true,
                width: width,
                height: height
            })

            // 移除临时容器
            document.body.removeChild(container)

            switch (format) {
                case 'png':
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `mermaid-diagram.png`
                            a.click()
                            URL.revokeObjectURL(url)
                        }
                    }, 'image/png')
                    break

                case 'jpg':
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `mermaid-diagram.jpg`
                            a.click()
                            URL.revokeObjectURL(url)
                        }
                    }, 'image/jpeg', 0.95)
                    break

                case 'pdf':
                    const imgData = canvas.toDataURL('image/png')
                    const pdf = new jsPDF({
                        orientation: width > height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [width, height]
                    })

                    if (!isDarkMode) {
                        pdf.setFillColor(255, 255, 255)
                        pdf.rect(0, 0, width, height, 'F')
                    }

                    pdf.addImage(imgData, 'PNG', 0, 0, width, height)
                    pdf.save('mermaid-diagram.pdf')
                    break
            }

            toast({
                title: "导出成功",
                description: `已成功导出为 ${format.toUpperCase()} 格式`,
            })
        } catch (error) {
            console.error('Export failed:', error)
            toast({
                title: "导出失败",
                description: "导出过程中发生错误，请重试",
                variant: "destructive",
            })
        }
    }

    return (
        <Select onValueChange={handleExport}>
            <SelectTrigger className="flex h-9 w-[120px] items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground">
                <Download className="h-4 w-4" />
                <span className="flex-1 text-left">导出</span>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="png">导出为 PNG</SelectItem>
                <SelectItem value="jpg">导出为 JPG</SelectItem>
                <SelectItem value="pdf">导出为 PDF</SelectItem>
            </SelectContent>
        </Select>
    )
} 