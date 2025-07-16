import mermaid from 'mermaid'

// 初始化 mermaid 配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'monospace',
  logLevel: 'debug',
  darkMode: false
})

interface RenderOptions {
  theme?: 'default' | 'dark' | 'neutral' | 'forest'
}

interface RenderResult {
  svg: string
  bindFunctions?: (element: Element) => void
}

// 解析Mermaid错误，返回具体的错误信息
function parseMermaidError(error: any): string {
  const errorMessage = error.message || error.toString()
  
  // 语法错误
  if (errorMessage.includes('Parse error')) {
    return '语法解析错误：请检查图表语法是否正确'
  }
  
  // 图表类型错误
  if (errorMessage.includes('No diagram type detected')) {
    return '未检测到图表类型：请确保以正确的关键字开始（如 graph、sequenceDiagram、classDiagram 等）'
  }
  
  // 节点定义错误
  if (errorMessage.includes('Lexical error')) {
    return '词法错误：请检查节点名称和连接符是否正确'
  }
  
  // 连接符错误
  if (errorMessage.includes('Expecting')) {
    const match = errorMessage.match(/Expecting (.+?),/)
    if (match) {
      return `期望的语法：${match[1]}，请检查语法格式`
    }
    return '语法格式错误：请检查连接符和节点定义'
  }
  
  // 图表类型特定错误
  if (errorMessage.includes('sequenceDiagram')) {
    return '时序图错误：请检查参与者定义和消息格式'
  }
  
  if (errorMessage.includes('classDiagram')) {
    return '类图错误：请检查类定义和关系语法'
  }
  
  if (errorMessage.includes('flowchart') || errorMessage.includes('graph')) {
    return '流程图错误：请检查节点定义和连接语法'
  }
  
  // 其他错误
  return `渲染错误：${errorMessage}`
}

export async function render(id: string, code: string, options: RenderOptions = {}): Promise<RenderResult> {
  try {
    console.log('Rendering mermaid diagram:', { id, code, options })
    
    // 更新配置
    mermaid.initialize({
      startOnLoad: false,
      theme: options.theme || 'default',
      securityLevel: 'loose',
      fontFamily: 'monospace',
      logLevel: 'debug',
      darkMode: options.theme === 'dark'
    })

    const { svg, bindFunctions } = await mermaid.render(id, code)
    console.log('Render successful:', { svg: svg.substring(0, 100) + '...' })
    return { svg, bindFunctions }
  } catch (error) {
    console.error('Failed to render mermaid diagram:', error)
    const detailedError = parseMermaidError(error)
    const enhancedError = new Error(detailedError)
    enhancedError.name = 'MermaidRenderError'
    throw enhancedError
  }
}

export { mermaid } 