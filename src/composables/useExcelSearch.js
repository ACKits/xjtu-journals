import { ref, computed } from 'vue'

export function useExcelSearch() {
  // 所有文件数据：{ fileName, data: [row, ...] }
  const fileDataList = ref([])
  // 文件选择状态：null = 全部，[] = 不选，[...] = 指定文件
  const selectedFileNames = ref(null)
  // 搜索关键词
  const searchQuery = ref('')
  // 扁平化所有数据，添加 _sourceFile 字段
  const allFlattenData = computed(() => {
    const result = []
    for (const item of fileDataList.value) {
      for (const row of item.data) {
        result.push({
          ...row,
          _sourceFile: item.fileName
        })
      }
    }
    return result
  })
  // 获取所有文件名列表
  const fileNames = computed(() => {
    return fileDataList.value.map(item => item.fileName)
  })
  // 根据选中的文件筛选
  const fileFilteredData = computed(() => {
    if (selectedFileNames.value === null) {
      return allFlattenData.value
    }
    if (selectedFileNames.value.length === 0) {
      return []
    }
    return allFlattenData.value.filter(
      row => selectedFileNames.value.includes(row._sourceFile)
    )
  })
  // 模糊搜索（在所有列中匹配）
  const filteredData = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) {
      return fileFilteredData.value
    }
    return fileFilteredData.value.filter(row => {
      for (const key of Object.keys(row)) {
        if (key === '_sourceFile') continue
        const val = String(row[key] || '').toLowerCase()
        if (val.includes(query)) {
          return true
        }
      }
      return false
    })
  })
  // 动态列名（从第一条数据中提取）
  const columns = computed(() => {
    if (filteredData.value.length === 0 && allFlattenData.value.length === 0) {
      return []
    }
    // 重点：只取了第 0 条数据（第一行）的 key
    const sample = filteredData.value.length > 0 ? filteredData.value[0] : allFlattenData.value[0]
    return Object.keys(sample).filter(key => key !== '_sourceFile')
  })
  // 统计信息
  const totalFiles = computed(() => fileDataList.value.length)
  const totalRecords = computed(() => allFlattenData.value.length)
  const matchedCount = computed(() => filteredData.value.length)
  // 添加文件数据
  function addFileData(fileName, data) {
    fileDataList.value.push({ fileName, data })
  }
  // 清空所有文件
  function clearAllFiles() {
    fileDataList.value = []
    selectedFileNames.value = null
    searchQuery.value = ''
  }
  // 切换文件选择
  function toggleFileSelection(fileName) {
    if (selectedFileNames.value === null) {
      selectedFileNames.value = fileNames.value.filter(name => name !== fileName)
      return
    }
    const index = selectedFileNames.value.indexOf(fileName)
    if (index === -1) {
      selectedFileNames.value.push(fileName)
    } else {
      selectedFileNames.value.splice(index, 1)
    }
    if (fileNames.value.length > 0 && selectedFileNames.value.length === fileNames.value.length) {
      selectedFileNames.value = null
    }
  }
  // 选择全部/取消全部
  function toggleSelectAll() {
    if (selectedFileNames.value === null || selectedFileNames.value.length === fileNames.value.length) {
      selectedFileNames.value = []
    } else {
      selectedFileNames.value = null
    }
  }
  // 判断是否全选
  const isAllSelected = computed(() => {
    return fileNames.value.length > 0 &&
      (selectedFileNames.value === null || selectedFileNames.value.length === fileNames.value.length)
  })
  return {
    fileDataList,
    selectedFileNames,
    searchQuery,
    allFlattenData,
    fileNames,
    filteredData,
    columns,
    totalFiles,
    totalRecords,
    matchedCount,
    addFileData,
    clearAllFiles,
    toggleFileSelection,
    toggleSelectAll,
    isAllSelected
  }
}