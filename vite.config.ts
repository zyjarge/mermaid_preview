import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 启用 Fast Refresh
      fastRefresh: true,
    }),
    {
      name: 'copy-manifest',
      closeBundle() {
        // 复制 manifest.json 到 dist 目录
        fs.copyFileSync('manifest.json', 'dist/manifest.json')
        // 确保popup目录存在
        if (!fs.existsSync('dist/popup')) {
          fs.mkdirSync('dist/popup', { recursive: true })
        }
        // 移动HTML文件到正确位置
        if (fs.existsSync('dist/src/popup/index.html')) {
          fs.copyFileSync('dist/src/popup/index.html', 'dist/popup/index.html')
          // 清理原始位置的文件
          fs.unlinkSync('dist/src/popup/index.html')
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
    sourcemap: true, // 生成 sourcemap
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
          codemirror: [
            '@codemirror/lang-markdown',
            '@codemirror/theme-one-dark',
            '@uiw/react-codemirror'
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'terser', // 使用 terser 进行压缩
    terserOptions: {
      compress: {
        drop_console: false, // 保留 console
        drop_debugger: true, // 删除 debugger
      }
    }
  },
  server: {
    port: 3000,
    open: false,
    cors: true,
  },
  preview: {
    port: 3000,
    open: false,
  }
}) 