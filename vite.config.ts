import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // 复制 manifest.json 到 dist 目录
        fs.copyFileSync('manifest.json', 'dist/manifest.json')
        // 确保popup目录存在
        if (!fs.existsSync('dist/popup')) {
          fs.mkdirSync('dist/popup')
        }
        // 移动HTML文件到正确位置
        if (fs.existsSync('dist/src/popup/index.html')) {
          fs.copyFileSync('dist/src/popup/index.html', 'dist/popup/index.html')
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'popup/index': 'src/popup/index.html',
        'content/index': 'src/content/index.ts',
        'background/index': 'src/background/index.ts',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        format: 'es',
        manualChunks: {
          mermaid: ['mermaid'],
          react: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
  },
}) 