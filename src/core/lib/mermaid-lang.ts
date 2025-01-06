import { StreamLanguage, StreamParser } from '@codemirror/language'
import { LanguageSupport } from '@codemirror/language'

// Mermaid 关键字
const keywords = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'erDiagram', 'gantt', 'pie', 'journey', 'gitGraph', 'mindmap'
]

// 方向关键字
const directions = ['TB', 'TD', 'BT', 'RL', 'LR']

interface MermaidState {
    inString: boolean
    inComment: boolean
    inDirective: boolean
}

// 创建 Mermaid 语言解析器
const parser: StreamParser<MermaidState> = {
    name: 'mermaid',
    startState: () => ({
        inString: false,
        inComment: false,
        inDirective: false
    }),
    token: (stream, state) => {
        // 处理注释
        if (stream.match('%%')) {
            stream.skipToEnd()
            return 'comment'
        }

        // 处理字符串
        if (state.inString) {
            if (stream.skipTo('"')) {
                stream.next()
                state.inString = false
            } else {
                stream.skipToEnd()
            }
            return 'string'
        }

        if (stream.peek() === '"') {
            stream.next()
            state.inString = true
            return 'string'
        }

        // 处理关键字
        if (stream.match(/^[a-zA-Z]+/) && keywords.includes(stream.current())) {
            return 'keyword'
        }

        // 处理方向
        if (stream.match(/^[A-Z]{2}/) && directions.includes(stream.current())) {
            return 'keyword'
        }

        // 处理箭头和形状
        if (stream.match(/[->]+/)) {
            return 'operator'
        }

        if (stream.match(/[\(\)\[\]\{\}><]+/)) {
            return 'bracket'
        }

        // 跳过空白字符
        if (stream.eatSpace()) return null

        // 跳过其他字符
        stream.next()
        return null
    }
}

// 创建 Mermaid 语言支持
export const mermaidLanguage = StreamLanguage.define(parser)

// 导出语言支持
export function mermaid(): LanguageSupport {
    return new LanguageSupport(mermaidLanguage)
} 