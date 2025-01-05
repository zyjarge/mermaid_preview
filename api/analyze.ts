import type { VercelRequest, VercelResponse } from '@vercel/node'

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({
            code: 405,
            msg: '方法不允许'
        })
    }

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

        const response = await fetch(ZHIPU_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'glm-4',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || '智谱 AI 服务异常')
        }

        const result = await response.json()
        const explanation = result.choices[0]?.message?.content || '无法生成解释'

        return res.status(200).json({
            code: 200,
            msg: 'success',
            data: {
                explanation
            }
        })
    } catch (error: any) {
        console.error('AI 解释失败:', error)
        return res.status(500).json({
            code: 500,
            msg: '解析失败，请稍后重试',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
} 