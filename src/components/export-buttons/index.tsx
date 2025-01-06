import React from 'react'
import { Download } from 'lucide-react'
import type { ExportButtonsProps } from '@/types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const ExportButtons: React.FC<ExportButtonsProps> = ({ previewRef }) => {
    const exportImage = async (format: 'png' | 'jpg') => {
        if (!previewRef.current) return

        try {
            const canvas = await html2canvas(previewRef.current)
            const url = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : undefined)
            const link = document.createElement('a')
            link.download = `mermaid-diagram.${format}`
            link.href = url
            link.click()
        } catch (error) {
            console.error(`导出${format}图片失败:`, error)
        }
    }

    const exportPDF = async () => {
        if (!previewRef.current) return

        try {
            const canvas = await html2canvas(previewRef.current)
            const imgData = canvas.toDataURL('image/jpeg', 0.9)

            // 计算PDF尺寸
            const imgWidth = canvas.width
            const imgHeight = canvas.height
            const ratio = imgWidth / imgHeight

            let pdfWidth = 210 // A4 宽度（mm）
            let pdfHeight = pdfWidth / ratio

            // 如果高度超过 A4，则按高度适配
            if (pdfHeight > 297) {
                pdfHeight = 297 // A4 高度（mm）
                pdfWidth = pdfHeight * ratio
            }

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
            })

            // 居中显示
            const x = (pdf.internal.pageSize.width - pdfWidth) / 2
            const y = (pdf.internal.pageSize.height - pdfHeight) / 2

            pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight)
            pdf.save('mermaid-diagram.pdf')
        } catch (error) {
            console.error('导出PDF失败:', error)
        }
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => exportImage('png')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="导出 PNG"
            >
                <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="ml-1 text-sm">PNG</span>
            </button>
            <button
                onClick={() => exportImage('jpg')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="导出 JPG"
            >
                <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="ml-1 text-sm">JPG</span>
            </button>
            <button
                onClick={exportPDF}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="导出 PDF"
            >
                <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="ml-1 text-sm">PDF</span>
            </button>
        </div>
    )
} 