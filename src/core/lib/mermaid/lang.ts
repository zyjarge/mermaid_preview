import { LanguageSupport, StreamLanguage } from '@codemirror/language'

const mermaidSyntax = StreamLanguage.define({
  token(stream) {
    if (stream.match(/^graph\s+/)) return 'keyword'
    if (stream.match(/^sequenceDiagram\s+/)) return 'keyword'
    if (stream.match(/^classDiagram\s+/)) return 'keyword'
    if (stream.match(/^stateDiagram-v2\s+/)) return 'keyword'
    if (stream.match(/^erDiagram\s+/)) return 'keyword'
    if (stream.match(/^gantt\s+/)) return 'keyword'
    if (stream.match(/^pie\s+/)) return 'keyword'
    if (stream.match(/^flowchart\s+/)) return 'keyword'
    if (stream.match(/^journey\s+/)) return 'keyword'

    if (stream.match(/^title\s+/)) return 'def'
    if (stream.match(/^participant\s+/)) return 'def'
    if (stream.match(/^actor\s+/)) return 'def'
    if (stream.match(/^note\s+/)) return 'comment'
    if (stream.match(/^loop\s+/)) return 'keyword'
    if (stream.match(/^alt\s+/)) return 'keyword'
    if (stream.match(/^else\s+/)) return 'keyword'
    if (stream.match(/^opt\s+/)) return 'keyword'
    if (stream.match(/^par\s+/)) return 'keyword'
    if (stream.match(/^end\s+/)) return 'keyword'

    if (stream.match(/^class\s+/)) return 'def'
    if (stream.match(/^state\s+/)) return 'def'
    if (stream.match(/^section\s+/)) return 'def'

    if (stream.match(/^-->|==>|-.->|==>/)) return 'operator'
    if (stream.match(/^--/)) return 'operator'
    if (stream.match(/^::/)) return 'operator'
    if (stream.match(/^:/)) return 'operator'

    if (stream.match(/^[\[\]{}()]/)) return 'bracket'
    if (stream.match(/^[<>]/)) return 'bracket'

    if (stream.match(/^"/)) {
      stream.skipTo('"')
      stream.next()
      return 'string'
    }

    if (stream.match(/^'/)) {
      stream.skipTo("'")
      stream.next()
      return 'string'
    }

    stream.next()
    return null
  },
  startState() {
    return {}
  },
})

export function mermaid() {
  return new LanguageSupport(mermaidSyntax)
} 