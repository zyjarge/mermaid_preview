import type { Request, Response } from 'express'
import { zhipuAI } from './services/zhipu'

export async function analyzeHandler(req: Request, res: Response) {
    try {
        const { code } = req.body

        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                code: 400,
                msg: '请提供有效的 Mermaid 代码',
            })
        }

        const prompt = `
请分析以下 Mermaid 图表代码，并提供详细的解释。解释应该包括：
1. 图表的类型和主要用途
2. 图表中的主要元素和它们之间的关系
3. 图表想要表达的核心信息或流程

Mermaid 代码：
${code}

请用中文回答，语言要通俗易懂，避免过于技术化的描述。
`

        const response = await zhipuAI.chat.completions.create({
            model: 'glm-4',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        })

        const explanation = response.choices[0]?.message?.content || '无法生成解释'

        res.json({
            code: 200,
            msg: 'success',
            data: {
                explanation
            }
        })
    } catch (error) {
        console.error('AI 解释失败:', error)
        res.status(500).json({
            code: 500,
            msg: '解析失败，请稍后重试',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
} 