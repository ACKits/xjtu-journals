import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

const inputFile = path.resolve('./public/excel/conferences/附件13 2022各学院“国内外顶级学术会议名录”.xlsx') //该文件用后已删除，若重新生成须放入该文件
const outputDir = path.resolve('./public/excel/conferences')

if (!fs.existsSync(inputFile)) {
  console.error(`找不到输入文件：${inputFile}`)
  process.exit(1)
}

fs.mkdirSync(outputDir, { recursive: true })

const workbook = XLSX.readFile(inputFile)
const sheet = workbook.Sheets[workbook.SheetNames[0]]

const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: ''
})

const sections = []
let currentSection = null

for (const row of rows) {
  const firstCell = String(row[0] ?? '').trim()
  const secondCell = String(row[1] ?? '').trim()

  // 匹配：一、二、三、……这种分类标题
  if (/^[一二三四五六七八九十百]+、$/.test(firstCell)) {
    if (currentSection) {
      sections.push(currentSection)
    }

    currentSection = {
      title: secondCell,
      rows: []
    }

    continue
  }

  if (!currentSection) {
    continue
  }

  // 只保留第一列为数字的正式会议记录
  if (/^\d+$/.test(firstCell)) {
    currentSection.rows.push([
      firstCell,
      secondCell,
      String(row[2] ?? '').trim(),
      String(row[3] ?? '').trim()
    ])
  }
}

if (currentSection) {
  sections.push(currentSection)
}

console.log(`共发现 ${sections.length} 个会议分类`)

for (const section of sections) {
  if (!section.title) {
    console.warn('跳过没有标题的分类')
    continue
  }

  // 最终文件不再包含分类标题行
  const data = [
    ['序号', '会议名称', '主办方', '周期'],
    ...section.rows
  ]

  const newWorkbook = XLSX.utils.book_new()
  const newSheet = XLSX.utils.aoa_to_sheet(data)

  XLSX.utils.book_append_sheet(
    newWorkbook,
    newSheet,
    '会议名录'
  )

  // 用分类标题作为文件名
  // 去掉 Windows/macOS 文件名中的非法字符
  const safeTitle = section.title
    .replace(/[\/\\:*?"<>|]/g, '_')
    .trim()

  const outputFile = path.join(
    outputDir,
    `${safeTitle}.xlsx`
  )

  XLSX.writeFile(newWorkbook, outputFile)

  console.log(
    `${safeTitle}.xlsx ← ${section.rows.length} 条`
  )
}