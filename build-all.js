import { build } from 'vite'
import path from 'path'

import { fileURLToPath } from 'url'

// 兼容 ESM 下的 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 打包函数
async function buildApp(mode, outDir) {
  await build({
    mode,
    build: {
      outDir: path.resolve(__dirname, 'dist', outDir)
    }
  })
  console.log(`✅ ${mode} 打包完成: dist/${outDir}`)
}

async function run() {
  await buildApp('test', 'test')
  await buildApp('production', 'production')
}

run()
