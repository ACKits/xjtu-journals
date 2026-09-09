import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const excelDir = path.join(__dirname, '../public/excel')

if (fs.existsSync(excelDir)) {
  const files = fs.readdirSync(excelDir)
    .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
    .filter(f => f !== 'index.json')

  fs.writeFileSync(
    path.join(excelDir, 'index.json'),
    JSON.stringify({ files }, null, 2)
  )
  console.log(`已生成清单，包含 ${files.length} 个文件`)
}