<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SearchBar from './components/SearchBar.vue'
import FileSelector from './components/FileSelector.vue'
import ResultTable from './components/ResultTable.vue'
import { useExcelSearch } from './composables/useExcelSearch.js'
import * as XLSX from 'xlsx'
import Header from "./components/Header.vue";

const {
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
const dataType = ref('journal')

const hasSearchQuery = computed(() => Boolean(searchQuery.value?.trim()))

/**
 * 批量加载 Excel 文件
 * 依次读取清单 index.json，再逐个拉取 Excel 并解析为 JSON
 * @returns {Promise<void>}
 */
async function loadExcelFilesFromSrc() {
  // 初始化 loading 状态
  isLoading.value = true
  loadedCount.value = 0
  totalFileCount.value = 0

  // 强制让浏览器先绘制 loading 状态
  await new Promise(resolve => setTimeout(resolve, 0))

  try {
    // 根据 dataType 决定目录名
    const folder = dataType.value === 'journal' ? 'journals' : 'conferences'

    // 拉取文件清单 index.json
    const manifestRes = await fetch(
        `${import.meta.env.BASE_URL}excel/${folder}/index.json`,
        { cache: 'no-store' }
    )
    if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status}`)

    // 解析清单，过滤出有效文件名
    const manifest = await manifestRes.json()
    const files = Array.isArray(manifest.files)
        ? manifest.files.filter(f => f && f.trim())
        : []
    totalFileCount.value = files.length
    if (!files.length) return

    // 逐个加载并解析 Excel
    for (const fileName of files) {
      try {
        const res = await fetch(
            `${import.meta.env.BASE_URL}excel/${folder}/${encodeURIComponent(fileName)}`
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const buffer = await res.arrayBuffer()
        const workbook = XLSX.read(buffer, {
          type: 'array',
          cellFormula: false,
          cellHTML: false,
          cellStyles: false
        })
        const sheetName = workbook.SheetNames[0]
        const jsonData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName],
            { defval: '' }
        )

        addFileData(fileName, jsonData)
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

/**
 * 切换数据类型（期刊 / 会议），并重新加载对应的 Excel 文件
 * 若目标类型与当前一致、或正在加载中，则直接返回，避免重复请求
 * @param {'journal' | 'conference'} type - 目标数据类型
 * @returns {Promise<void>}
 */
async function switchDataType(type) {
  // 类型未变或正在加载中，直接返回
  if (type === dataType.value || isLoading.value) return

  dataType.value = type
  clearAllFiles()
  await loadExcelFilesFromSrc()
}

/**
 * 监听滚动事件，超过 300px 时显示"回到顶部"按钮
 */
function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

/**
 * 平滑滚动回页面顶部
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 文件加载完成后的回调，将每个文件的数据加入搜索列表
 * @param {Array<{ fileName: string, data: any[] }>} loadedFiles - 已加载的文件列表
 */
function handleFilesLoaded(loadedFiles) {
  for (const { fileName, data } of loadedFiles) addFileData(fileName, data)
  // 上传后自动全选（如果需要，但这里保持原有行为：不强制全选，避免干扰用户选择）
  // 若希望上传后也全选，可取消注释下一行
  // if (fileNames.value.length > 0) selectedFileNames.value = fileNames.value.slice()
}

// 挂载时：加载 Excel 文件并监听页面滚动
onMounted(() => {
  loadExcelFilesFromSrc()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// 卸载时：移除滚动监听，避免内存泄漏
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="elegant-layout">
    <div class="app-container">
      <div class="sticky-header-wrapper">

        <Header/>

        <div class="data-type-switch">
          <button :class="{ active: dataType === 'journal' }" @click="switchDataType('journal')"> 期刊 </button>
          <button :class="{ active: dataType === 'conference' }" @click="switchDataType('conference')"> 会议 </button>
        </div>

        <section class="control-center">
          <div class="search-wrapper">
            <SearchBar v-model="searchQuery" class="pro-search" :placeholder="dataType === 'journal'
                  ? '输入关键字检索期刊...'
                  : '输入关键字检索会议...'"
            />
          </div>
          <div>
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
            <div v-if="isLoading" class="status-item loading-status">
              <span class="spinner"></span>
              <span>正在解析 {{ loadedCount }}/{{ totalFileCount }} 个文件</span>
            </div>

            <div v-else class="status-item">
              <span class="status-dot"></span>
              <span>{{ totalFiles }} 个文件 · {{ totalRecords.toLocaleString() }} 条记录</span>
            </div>
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
          <ResultTable :data="filteredData" :columns="columns" />
        </section>

        <section v-else class="empty-search-placeholder">
          <div class="placeholder-content">
            <div class="search-icon-bag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="11" cy="11" r="7.5"></circle>
                <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
              </svg>
            </div>
            <p>输入关键词后，系统将从目录中查找匹配记录。</p>
          </div>
        </section>
      </main>
    </div>

    <footer class="site-footer">
      <div class="footer-inner">
        <span class="footer-title">XJTU Journal Explorer</span>

        <div class="footer-meta">
          <div class="footer-badges">
            <a href="https://github.com/ACKits/xjtu-journals" target="_blank" rel="noopener noreferrer" >
              <img src="https://img.shields.io/badge/GitHub-ACKits-181717?style=flat&logo=github&logoColor=white" alt="GitHub" />
            </a>
            <img src="https://img.shields.io/badge/License-MIT-2563eb?style=flat" alt="MIT License" />
            <img src="https://visitor-badge.laobi.icu/badge?page_id=ACKits.xjtu-journals&left_text=Visitors" alt="visitor badge"/>
          </div>

          <span class="footer-copy">© 2026 ACKits</span>
        </div>
      </div>
    </footer>

    <transition name="fade-scale">
      <button v-if="showBackToTop" class="back-to-top" @click="scrollToTop" aria-label="返回顶部" title="返回顶部">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 19V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M6 11L12 5L18 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </transition>
  </div>
</template>

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
  overflow-x: clip;
}

.app-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.sticky-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  padding: 20px 0 14px;
  background: rgba(255,255,255,.97);
}

.control-center {
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15,23,42,.03);
}

.data-type-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  height: 32px;
  margin-bottom: 10px;
}
.data-type-switch button {
  position: relative;
  height: 32px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: #8a94a3;
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: color .18s ease;
}
.data-type-switch button::after {
  content: "";
  position: absolute;
  left: 2px;
  right: 2px;
  bottom: 0;
  height: 2px;
  border-radius: 1px;
  background: transparent;
  transition: background .18s ease;
}
.data-type-switch button:hover {
  color: #475569;
}
.data-type-switch button.active {
  color: #2563eb;
  font-weight: 600;
}
.data-type-switch button.active::after {
  background: #2563eb;
}

.search-wrapper {
  margin-bottom: 18px;
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
  font-size: var(--font-size-xs);
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
@keyframes spin {
  to { transform: rotate(360deg); }
}
.result-count {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #2563eb;
}

.main-content {
  padding-top: 20px;
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
.placeholder-content p {
  margin: 0;
  font-size: var(--font-size-base);
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

@media (max-width: 768px) {
  .app-container {
    padding: 0 16px 36px;
  }
  .sticky-header-wrapper {
    padding-top: 14px;
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

.site-footer {
  width: 100%;
  margin-top: 24px;
}
.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.footer-title {
  font-size: var(--font-size-xs);
  color: #6b7280;
}
.footer-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.footer-badges {
  display: flex;
  align-items: center;
  gap: 5px;
}
.footer-badges img {
  display: block;
  height: 15px;
  border-radius: 4px;
}
.footer-badges a {
  display: block;
  line-height: 0;
  transition: opacity .18s ease;
}
.footer-badges a:hover {
  opacity: .78;
}
.footer-copy {
  color: #9aa3af;
  font-size: var(--font-size-xs);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
  }

  .footer-meta {
    width: auto;
    justify-content: flex-start;
    gap: 8px;
  }
}
</style>