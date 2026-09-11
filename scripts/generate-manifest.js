import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const excelDir = path.join(__dirname, '../public/excel')

function generateManifest(folder) {
  const dir = path.join(excelDir, folder)

  if (!fs.existsSync(dir)) {
    console.log(`目录不存在，跳过：${folder}`)
    return
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }))

  fs.writeFileSync(
    path.join(dir, 'index.json'),
    JSON.stringify({ files }, null, 2)
  )

  console.log(`${folder}: 已生成清单，包含 ${files.length} 个文件`)
}

if (fs.existsSync(excelDir)) {
  generateManifest('journals')
  generateManifest('conferences')
}