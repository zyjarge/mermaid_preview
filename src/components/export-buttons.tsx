import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

interface ExportButtonsProps {
    previewRef: React.RefObject<HTMLDivElement>
}

export function ExportButtons({ previewRef }: ExportButtonsProps) {
    const exportAs = async (type: 'png' | 'jpg' | 'pdf') => {
        if (!previewRef.current) return

        const svg = previewRef.current.querySelector('svg')
        if (!svg) return

        try {
            const container = document.createElement('div')
            container.style.background = type === 'jpg' ? '#ffffff' : 'transparent'
            container.innerHTML = svg.outerHTML
            document.body.appendChild(container)

            const canvas = await html2canvas(container)
            document.body.removeChild(container)

            if (type === 'pdf') {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                })
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
                pdf.save('mermaid-diagram.pdf')
            } else {
                const link = document.createElement('a')
                link.download = `mermaid-diagram.${type}`
                link.href = canvas.toDataURL(`image/${type}`)
                link.click()
            }
        } catch (error) {
            console.error('导出失败:', error)
        }
    }

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => exportAs('png')}
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="导出为PNG"
            >
                <Download className="w-4 h-4" />
                <span>PNG</span>
            </button>
            <button
                onClick={() => exportAs('jpg')}
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="导出为JPG"
            >
                <Download className="w-4 h-4" />
                <span>JPG</span>
            </button>
            <button
                onClick={() => exportAs('pdf')}
                className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="导出为PDF"
            >
                <Download className="w-4 h-4" />
                <span>PDF</span>
            </button>
        </div>
    )
} 