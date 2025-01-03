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
            // 创建一个临时的div来包含SVG
            const container = document.createElement('div')
            container.style.background = type === 'jpg' ? '#ffffff' : 'transparent'
            container.innerHTML = svg.outerHTML
            document.body.appendChild(container)

            // 使用html2canvas捕获临时div
            const canvas = await html2canvas(container)

            // 移除临时div
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
        <div className="flex gap-2">
            <button
                onClick={() => exportAs('png')}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
                <Download className="w-4 h-4" />
                PNG
            </button>
            <button
                onClick={() => exportAs('jpg')}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
                <Download className="w-4 h-4" />
                JPG
            </button>
            <button
                onClick={() => exportAs('pdf')}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
                <Download className="w-4 h-4" />
                PDF
            </button>
        </div>
    )
} 