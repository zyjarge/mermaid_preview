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
    throw error
  }
}

export { mermaid } 