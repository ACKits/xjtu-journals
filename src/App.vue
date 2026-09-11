<template>
  <div class="elegant-layout">
    <div class="app-container">
      <div class="sticky-header-wrapper">
        <header class="app-header">
          <div class="logo-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
              <defs>
                <!-- 主体 Excel 绿色渐变 -->
                <linearGradient id="excelGreen" x1="8" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#10B981" />
                  <stop offset="100%" stop-color="#059669" />
                </linearGradient>
                <!-- 搜索蓝渐变 -->
                <linearGradient id="searchBlue" x1="32" y1="32" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#3B82F6" />
                  <stop offset="100%" stop-color="#1D4ED8" />
                </linearGradient>
              </defs>
              <!-- 1. 表格主体背景卡片 -->
              <rect x="8" y="8" width="40" height="48" rx="8" fill="url(#excelGreen)" />
              <!-- 2. 表格数据列（用白块和浅色透明块巧妙交织，代表数据表） -->
              <!-- 顶部表头区块 -->
              <rect x="15" y="16" width="12" height="5" rx="2" fill="#FFFFFF" />
              <rect x="30" y="16" width="11" height="5" rx="2" fill="#FFFFFF" opacity="0.6" />
              <!-- 数据行 1 -->
              <rect x="15" y="25" width="26" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
              <!-- 数据行 2 -->
              <rect x="15" y="33" width="16" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
              <!-- 数据行 3 -->
              <rect x="15" y="41" width="10" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
              <!-- 3. 右下角镂空叠加的精致放大镜 -->
              <circle cx="41" cy="41" r="11" fill="#FFFFFF" />
              <circle cx="41" cy="41" r="8" fill="url(#searchBlue)" />
              <path d="M47 47 L55 55" stroke="url(#searchBlue)" stroke-width="4.5" stroke-linecap="round" />
            </svg>
          </div>
          <div class="titles">
            <h1>XJTU Journal Explorer</h1>
            <p>快速查询期刊与会议收录情况</p>
          </div>
        </header>

        <section class="control-center">
          <div class="search-wrapper">
            <SearchBar v-model="searchQuery" class="pro-search" placeholder="输入关键字检索 期刊/会议 是否被收录..." />
          </div>
          <div class="filter-wrapper">
            <FileSelector
                :fileNames="fileNames"
                :selectedFileNames="selectedFileNames"
                :isAllSelected="isAllSelected"
                :disabled="isLoading"
                @update:selectedFileNames="selectedFileNames = $event"
                @toggleAll="toggleSelectAll"
                @toggleFile="toggleFileSelection"
                @filesLoaded="handleFilesLoaded"
            />
          </div>
        </section>

        <section class="status-bar">
          <div class="status-left">
            <transition name="fade" mode="out-in">
              <div v-if="isLoading" class="status-item loading-status">
                <span class="spinner"></span>
                <span>正在解析 {{ loadedCount }}/{{ totalFileCount }} 个文件</span>
              </div>
              <div v-else class="status-item">
                <span class="status-dot"></span>
                <span>{{ totalFiles }} 个文件 · {{ totalRecords.toLocaleString() }} 条记录</span>
              </div>
            </transition>
          </div>
          <transition name="fade">
            <div v-if="hasSearchQuery && !isLoading" class="result-count">
              {{ matchedCount.toLocaleString() }} 条匹配结果
            </div>
          </transition>
        </section>
      </div>

      <main class="main-content">
        <section v-if="hasSearchQuery" class="data-viewport">
          <div class="table-full-display">
            <ResultTable :data="filteredData" :columns="columns" />
          </div>
        </section>

        <section v-else class="data-viewport empty-search-placeholder">
          <div class="placeholder-content">
            <div class="search-icon-bag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="11" cy="11" r="7.5"></circle>
                <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
              </svg>
            </div>
            <h3>开始搜索</h3>
            <p>输入关键词后，系统将从校定目录中查找匹配记录。</p>
          </div>
        </section>
      </main>
    </div>

    <transition name="fade-scale">
      <button
          v-if="showBackToTop"
          class="back-to-top"
          @click="scrollToTop"
          aria-label="返回顶部"
          title="返回顶部"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 19V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M6 11L12 5L18 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import FileSelector from './components/FileSelector.vue'
import ResultTable from './components/ResultTable.vue'
import { useExcelSearch } from './composables/useExcelSearch.js'
import * as XLSX from 'xlsx'

const {
  fileDataList,
  selectedFileNames,
  searchQuery,
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
} = useExcelSearch()

const isLoading = ref(false)
const loadedCount = ref(0)
const totalFileCount = ref(0)
const showBackToTop = ref(false)

const hasSearchQuery = computed(() => Boolean(searchQuery.value?.trim()))

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function loadExcelFilesFromSrc() {
  if (import.meta.env.MODE === 'demo') return

  isLoading.value = true
  loadedCount.value = 0
  totalFileCount.value = 0

  try {
    const manifestRes = await fetch(`${import.meta.env.BASE_URL}excel/index.json`, { cache: 'no-store' })
    if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status}`)

    const manifest = await manifestRes.json()
    const files = Array.isArray(manifest.files) ? manifest.files.filter(f => f && f.trim()) : []

    totalFileCount.value = files.length
    if (!files.length) return

    for (const fileName of files) {
      await sleep(20)
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}excel/${encodeURIComponent(fileName)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = await res.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array', cellFormula: false, cellHTML: false, cellStyles: false })
        const sheetName = workbook.SheetNames[0]
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
        if (jsonData.length) addFileData(fileName, jsonData)
      } catch (err) {
        console.error(`加载 ${fileName} 失败:`, err)
      } finally {
        loadedCount.value++
      }
    }
  } catch (err) {
    console.error('加载文件清单失败:', err)
  } finally {
    isLoading.value = false
  }
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleFilesLoaded(loadedFiles) {
  for (const { fileName, data } of loadedFiles) addFileData(fileName, data)
  // 上传后自动全选（如果需要，但这里保持原有行为：不强制全选，避免干扰用户选择）
  // 若希望上传后也全选，可取消注释下一行
  // if (fileNames.value.length > 0) selectedFileNames.value = fileNames.value.slice()
}

onMounted(() => {
  loadExcelFilesFromSrc()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(html) {
  scroll-behavior: smooth;
  scrollbar-gutter: stable both-edges;
}
:global(body) {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  overflow-x: hidden;
  background: #fff;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1f2937;
}
:global(button),
:global(input) {
  font: inherit;
}
.elegant-layout {
  width: 100%;
  min-height: 100vh;
  background: #fff;
  color: #1f2937;
  overflow-x: clip;
}
.app-container {
  width: 100%;
  max-width: 1280px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 24px 48px;
}
.sticky-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  padding: 20px 0 14px;
  background: rgba(255,255,255,.97);
  border-bottom: 1px solid #eef0f3;
}
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.logo-wrapper {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
}
.logo {
  width: 19px;
  height: 19px;
}
.titles {
  min-width: 0;
}
.titles h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -.025em;
  color: #111827;
}
.titles p {
  margin: 3px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: #8a94a3;
}
.control-center {
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15,23,42,.03);
}
.search-wrapper {
  width: 100%;
  margin-bottom: 18px;
}

.filter-wrapper {
  width: 100%;
}
.status-bar {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 2px 0;
}
.status-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 500;
  color: #8a94a3;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}
.loading-status {
  color: #64748b;
}
.spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid #cbd5e1;
  border-top-color: #64748b;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
.result-count {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
}
.main-content {
  width: 100%;
  padding-top: 20px;
}
.data-viewport {
  width: 100%;
}
.table-full-display {
  width: 100%;
}
.empty-search-placeholder {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  background: #fff;
}
.placeholder-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.search-icon-bag {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  color: #64748b;
}
.search-icon-bag svg {
  width: 25px;
  height: 25px;
}
.placeholder-content h3 {
  margin: 0 0 7px;
  font-size: 16px;
  line-height: 1.4;
  font-weight: 650;
  color: #1f2937;
}
.placeholder-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #8a94a3;
}
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #e2e5e9;
  border-radius: 10px;
  outline: none;
  background: rgba(255,255,255,.98);
  color: #64748b;
  box-shadow: 0 4px 14px rgba(15,23,42,.08);
  cursor: pointer;
  transition: color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}
.back-to-top svg {
  width: 18px;
  height: 18px;
}
.back-to-top:hover {
  color: #2563eb;
  border-color: #bfdbfe;
  box-shadow: 0 6px 18px rgba(15,23,42,.1);
  transform: translateY(-2px);
}
.back-to-top:active {
  transform: translateY(0);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity .16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(.96);
}
@media (max-width: 768px) {
  .app-container {
    padding: 0 16px 36px;
  }
  .sticky-header-wrapper {
    padding-top: 14px;
  }
  .app-header {
    margin-bottom: 14px;
  }
  .titles h1 {
    font-size: 18px;
  }
  .control-center {
    padding: 14px;
  }
  .status-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
  .main-content {
    padding-top: 16px;
  }
  .back-to-top {
    right: 16px;
    bottom: 16px;
  }
}
</style>