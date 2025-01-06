import zhipuai from 'zhipuai'

if (!process.env.ZHIPU_API_KEY) {
    throw new Error('请在 .env 文件中设置 ZHIPU_API_KEY')
}

export const zhipuAI = new zhipuai({
    apiKey: process.env.ZHIPU_API_KEY
}) 