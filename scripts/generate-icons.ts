import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function generateIcons() {
  const iconSizes = [16, 32, 48, 128]
  const srcIcon = path.resolve(rootDir, 'src/assets/icon.svg')
  const destDir = path.resolve(rootDir, 'src/assets/icons')

  // 确保目标目录存在
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // 读取SVG文件
  const svgBuffer = fs.readFileSync(srcIcon)

  // 生成不同尺寸的PNG图标
  for (const size of iconSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.resolve(destDir, `icon${size}.png`))
  }

  console.log('Icons generated successfully!')
}

generateIcons().catch(console.error) 