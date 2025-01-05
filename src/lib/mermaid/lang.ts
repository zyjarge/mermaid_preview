import { LanguageSupport, StreamLanguage } from '@codemirror/language'

// Mermaid 关键字
const keywords = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'erDiagram', 'gantt', 'pie', 'gitGraph', 'journey', 'TD', 'TB', 'BT', 'RL', 'LR'
]

// Mermaid 语言定义
function mermaid() {
  return StreamLanguage.define({
    name: 'mermaid',
    startState: () => ({
      inString: false,
      inComment: false,
      inKeyword: false
    }),
    token(stream, state) {
      // 处理空格
      if (stream.eatSpace()) return null

      // 处理注释
      if (stream.match('%%')) {
        stream.skipToEnd()
        return 'comment'
      }

      // 处理字符串
      if (stream.match('"') || stream.match("'")) {
        state.inString = !state.inString
        return 'string'
      }

      if (state.inString) {
        stream.skipTo('"') || stream.skipTo("'") || stream.skipToEnd()
        return 'string'
      }

      // 处理关键字
      if (stream.match(/[A-Za-z]+/) && keywords.includes(stream.current())) {
        return 'keyword'
      }

      // 处理箭头
      if (stream.match(/[->|]+/)) {
        return 'operator'
      }

      // 处理括号
      if (stream.match(/[\[\]{}()]/)) {
        return 'bracket'
      }

      stream.next()
      return null
    }
  })
}

export function mermaidLanguage() {
  return new LanguageSupport(mermaid())
} 