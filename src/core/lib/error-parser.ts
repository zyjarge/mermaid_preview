export interface ParsedError {
  line?: number
  column?: number
  message: string
  expectation?: string
  received?: string
  context?: string
  rawError: string
}

export function parseError(errorMessage: string): ParsedError {
  console.log('Parsing error message:', errorMessage)
  
  // Parse error on line X pattern (支持多种格式)
  let lineMatch = errorMessage.match(/Parse error on line (\d+):/)
  if (!lineMatch) {
    lineMatch = errorMessage.match(/line (\d+)/)
  }
  if (!lineMatch) {
    lineMatch = errorMessage.match(/at line (\d+)/)
  }
  const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined
  
  // Extract the error context (the line with the arrow)
  let contextMatch = errorMessage.match(/\.\.\.(.*?)\n\s*-+\^/)
  if (!contextMatch) {
    contextMatch = errorMessage.match(/\.\.\.(.*?)$/)
  }
  const context = contextMatch ? contextMatch[1].trim() : undefined
  
  // Extract expectation and received (支持多种格式)
  let expectationMatch = errorMessage.match(/Expecting\s+['"]?([^'"]+)['"]?/)
  if (!expectationMatch) {
    expectationMatch = errorMessage.match(/Expected\s+['"]?([^'"]+)['"]?/)
  }
  
  let receivedMatch = errorMessage.match(/got\s+['"]?([^'"]+)['"]?/)
  if (!receivedMatch) {
    receivedMatch = errorMessage.match(/but found\s+['"]?([^'"]+)['"]?/)
  }
  
  const expectation = expectationMatch ? expectationMatch[1] : undefined
  const received = receivedMatch ? receivedMatch[1] : undefined
  
  // Create a more user-friendly message
  let message = '语法错误'
  if (line !== undefined) {
    message = `第 ${line} 行存在语法错误`
  }
  
  if (expectation && received) {
    message += `：期望 ${expectation}，但得到了 ${received}`
  }
  
  console.log('Parsed error:', { line, message, expectation, received, context })
  
  return {
    line,
    message,
    expectation,
    received,
    context,
    rawError: errorMessage
  }
}

export function getErrorLine(code: string, lineNumber: number): string | null {
  const lines = code.split('\n')
  if (lineNumber >= 1 && lineNumber <= lines.length) {
    return lines[lineNumber - 1]
  }
  return null
}

export function formatErrorDisplay(parsedError: ParsedError, code: string): {
  title: string
  description: string
  codeSnippet?: string
  lineNumber?: number
} {
  const { line, message, expectation, received, context } = parsedError
  
  let title = message
  let description = ''
  let codeSnippet: string | undefined
  
  if (line !== undefined) {
    const errorLine = getErrorLine(code, line)
    if (errorLine) {
      codeSnippet = errorLine
      description = `在第 ${line} 行发现语法错误`
      
      if (expectation && received) {
        description += `，期望 "${expectation}" 但得到了 "${received}"`
      }
      
      if (context) {
        description += `\n错误位置：${context}`
      }
    }
  } else {
    description = '代码存在语法错误，请检查语法是否符合 Mermaid 规范'
  }
  
  return {
    title,
    description,
    codeSnippet,
    lineNumber: line
  }
}