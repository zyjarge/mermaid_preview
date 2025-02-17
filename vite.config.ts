import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 自定义插件：复制必要文件到dist目录
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      console.log('Copying manifest and icons...')
      // 确保dist目录存在
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true })
      }
      // 复制 manifest.json
      fs.copyFileSync('manifest.json', 'dist/manifest.json')

      // 确保icons目录存在
      if (!fs.existsSync('dist/icons')) {
        fs.mkdirSync('dist/icons', { recursive: true })
      }

      // 复制图标文件
      const iconSizes = [16, 32, 48, 128]
      iconSizes.forEach(size => {
        const iconPath = `src/assets/icons/icon${size}.png`
        if (fs.existsSync(iconPath)) {
          fs.copyFileSync(iconPath, `dist/icons/icon${size}.png`)
          console.log(`Copied icon: ${iconPath}`)
        }
      })
      console.log('Manifest and icons copied successfully!')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
        content: path.resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'background') {
            return 'background/index.js'
          }
          if (chunk.name === 'content') {
            return 'content/index.js'
          }
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
}) 