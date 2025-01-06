import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { analyzeHandler } from './handlers'

// 加载环境变量
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.post('/api/analyze', analyzeHandler)

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack)
    res.status(500).json({
        code: 500,
        msg: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// 启动服务器
app.listen(port, () => {
    console.log(`API 服务器运行在 http://localhost:${port}`)
}) 