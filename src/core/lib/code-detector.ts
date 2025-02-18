export type CodeType = 'markdown' | 'mermaid' | 'unknown';

export class CodeDetector {
    static detect(code: string): CodeType {
        // mermaid 关键字检测
        const mermaidKeywords = [
            'graph', 'flowchart', 'sequenceDiagram', 
            'classDiagram', 'stateDiagram', 'erDiagram', 
            'gantt', 'pie', 'journey', 'gitGraph', 'mindmap'
        ];
        
        // 检查是否包含 mermaid 关键字
        if (mermaidKeywords.some(keyword => 
            code.trim().startsWith(keyword) || 
            code.includes(`\n${keyword} `)
        )) {
            return 'mermaid';
        }
        
        // markdown 特征检测
        const markdownFeatures = [
            /^#+ /, // 标题
            /\*\*.+\*\*/, // 粗体
            /\*.+\*/, // 斜体
            /\[.+\]\(.+\)/, // 链接
            /^\s*[-*+] /, // 无序列表
            /^\s*\d+\. /, // 有序列表
            /```[\s\S]*```/, // 代码块
            /^\|.*\|.*\|$/, // 表格行
            /^\|-+\|-+\|/, // 表格分隔符
            /^>.+/, // 引用
        ];
        
        // 检查每一行是否包含 Markdown 特征
        const lines = code.split('\n');
        for (const line of lines) {
            if (markdownFeatures.some(feature => feature.test(line))) {
                return 'markdown';
            }
        }

        // 特殊检查：表格结构（至少包含表头和分隔行）
        const hasTableHeader = lines.some(line => /^\|.*\|.*\|$/.test(line));
        const hasTableSeparator = lines.some(line => /^\|-+\|-+\|/.test(line));
        if (hasTableHeader && hasTableSeparator) {
            return 'markdown';
        }
        
        return 'unknown';
    }
} 