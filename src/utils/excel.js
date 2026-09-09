import * as XLSX from 'xlsx'

/**
 * 读取 Excel 文件并返回 JSON 数据（二维数组结构）
 * @param {File} file - 上传的文件对象
 * @returns {Promise<{ fileName: string, data: any[] }>}
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
        resolve({
          fileName: file.name,
          data: jsonData
        })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}