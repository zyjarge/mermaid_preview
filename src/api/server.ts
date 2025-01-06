import express from 'express'
import cors from 'cors'
import { ZhipuAI } from 'zhipuai'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const app = express()
const port = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 创建 AI 客户端
const client = new ZhipuAI({
    apiKey: process.env.ZHIPU_API_KEY,
})

// 解析图表路由
app.post('/analyze', async (req, res) => {
    try {
        const { code } = req.body

        if (!code) {
            return res.status(400).json({
                code: 400,
                msg: '请提供 Mermaid 图表代码',
            })
        }

        const prompt = `请分析并解释以下 Mermaid 图表代码，用通俗易懂的语言说明图表的含义和业务流程：\n\n${code}`

        const response = await client.chat.completions.create({
            model: 'glm-4',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        })

        const explanation = response.choices[0]?.message?.content || '无法生成解释'

        res.json({
            code: 200,
            msg: 'success',
            data: {
                explanation,
            },
        })
    } catch (error) {
        console.error('AI 解释失败:', error)
        res.status(500).json({
            code: 500,
            msg: '服务器错误',
            error: error instanceof Error ? error.message : '未知错误',
        })
    }
})

// 启动服务器
app.listen(port, () => {
    console.log(`API 服务器运行在 http://localhost:${port}`)
}) 