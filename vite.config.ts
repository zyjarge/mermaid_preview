import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const isExtension = mode === 'extension'
  console.log(`Building in ${mode} mode`)
  
  return {
    plugins: [
      react(),
      isExtension && {
        name: 'copy-manifest',
        closeBundle() {
          fs.copyFileSync('manifest.json', 'dist/manifest.json')
          if (!fs.existsSync('dist/popup')) {
            fs.mkdirSync('dist/popup', { recursive: true })
          }
          if (fs.existsSync('dist/src/popup/index.html')) {
            fs.copyFileSync('dist/src/popup/index.html', 'dist/popup/index.html')
            fs.unlinkSync('dist/src/popup/index.html')
          }
        }
      }
    ].filter(Boolean),
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@core': path.resolve(__dirname, './src/core'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@web': path.resolve(__dirname, './src/web'),
        '@extension': path.resolve(__dirname, './src/extension')
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      port: 3002,
      strictPort: false,
      open: true,
      cors: true,
      host: true,
      hmr: {
        overlay: true
      }
    }
  }
}) 