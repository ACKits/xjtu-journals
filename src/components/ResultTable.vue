<script setup>
import { ref, computed, watch } from 'vue'

/**
 * 组件 props
 * @property {Array} data - 表格数据源（必填）
 * @property {Array} columns - 列定义（必填）
 */
const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  columns: {
    type: Array,
    required: true,
    default: () => []
  }
})

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20) // 默认每页 20 条

/**
 * 计算总页数
 * 数据为空时返回 1，避免出现 0 页
 */
const totalPages = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.ceil(props.data.length / pageSize.value)
})

/**
 * 监听数据源或每页条数变化，重置回第一页
 * 避免切换后停留在超出范围的页码上
 */
watch([() => props.data, pageSize], () => {
  currentPage.value = 1
})

/**
 * 当前页的数据切片
 */
const paginatedData = computed(() => {
  if (!props.data) return []
  const start = (currentPage.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

/**
 * 获取行数据对应的来源文件名（兼容多种字段命名）
 * @param {Object} row - 行数据
 * @returns {string} 来源文件名，找不到时返回"未知文件"
 */
function getSourceFile(row) {
  if (!row) return '未知文件'
  return row._sourceFile || row.fileName || row._fileName || row['来源文件'] || '未知文件'
}

/**
 * 格式化单元格显示值，空值统一显示为 "-"
 * @param {*} value - 原始值
 * @returns {string}
 */
function formatCellValue(value) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  return String(value)
}
</script>

<template>
  <div class="result-table-wrapper">
    <div v-if="data && data.length" class="table-card">
      <!-- 1. 表格区域（只让它负责横向滚动） -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
          <tr>
            <th class="col-index">#</th>
            <th v-for="col in columns" :key="col">
              {{ col }}
            </th>
            <th class="col-filename">来源文件</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, idx) in paginatedData" :key="idx">
            <td class="col-index">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
            <td
                v-for="col in columns"
                :key="col"
                :title="formatCellValue(row[col])"
            >
              {{ formatCellValue(row[col]) }}
            </td>
            <td class="col-filename">
              <div class="file-cell" :title="getSourceFile(row)">
                <svg
                    class="file-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="file-name-text">{{ getSourceFile(row) }}</span>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. 分页控制栏（独立在表格滚动容器外，固定在底部） -->
      <div class="pagination-bar">
        <div class="pagination-info">
          共 <span class="highlight">{{ data.length }}</span> 条数据
        </div>
        <div class="pagination-controls">
          <!-- 每页条数选择 -->
          <div class="page-size-selector">
            <span>每页展示</span>
            <select v-model="pageSize" class="pagination-select">
              <option :value="10">10 条</option>
              <option :value="20">20 条</option>
              <option :value="50">50 条</option>
              <option :value="100">100 条</option>
            </select>
          </div>

          <!-- 页码切换按钮 -->
          <div class="page-buttons">
            <button
                class="page-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
                title="上一页"
            >
              ‹
            </button>
            <span class="page-num">
              <span class="highlight">{{ currentPage }}</span> / {{ totalPages }}
            </span>
            <button
                class="page-btn"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
                title="下一页"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7.5"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21"/>
        </svg>
      </div>
      <div class="empty-title">没有匹配的记录</div>
      <div class="empty-description">请尝试更换搜索关键词或文件范围。</div>
    </div>
  </div>
</template>

<style scoped>
.result-table-wrapper {
  width: 100%;
}

/* =========================
   Table Card
   ========================= */

.table-card {
  width: 100%;
  border: 1px solid #e8edf3;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .025);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* =========================
   Table Container
   ========================= */

.table-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

/* =========================
   Table
   ========================= */

.custom-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
  font-size: var(--font-size-base);
  color: #374151;
}

.custom-table th,
.custom-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #f3f5f7;
  word-break: normal;
  white-space: nowrap;
  vertical-align: middle;
}

/* Table header */

.custom-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f7f9fc;
  color: #64748b;
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: .01em;
  border-bottom: 1px solid #e8edf3;
}

/* Remove the final row divider */

.custom-table tbody tr:last-child td {
  border-bottom: 0;
}

/* Table rows */

.custom-table tbody tr {
  transition: background-color .15s ease;
}

.custom-table tbody tr:hover td {
  background: #f7faff;
}

.custom-table td {
  color: #374151;
  line-height: 1.55;
}

/* =========================
   Index Column
   ========================= */

.col-index {
  width: 48px;
  min-width: 48px;
  text-align: center !important;
  color: #a8b0bc !important;
  font-size: var(--font-size-sm) !important;
  font-weight: 500 !important;
}

/* =========================
   Source File Column
   ========================= */

.col-filename {
  min-width: 220px;
  color: #64748b;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: #7b8796;
}

.file-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  color: #a0aab8;
}

.file-name-text {
  min-width: 0;
  overflow: hidden;
  color: #7b8796;
  font-size: var(--font-size-base);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================
   Pagination
   ========================= */

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #fff;
  border-top: 1px solid #eef1f5;
  font-size: var(--font-size-xs);
  color: #8a94a3;
  flex-shrink: 0;
}

.pagination-info {
  white-space: nowrap;
}

.pagination-info .highlight {
  color: #475569;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Page size */

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.pagination-select {
  min-height: 27px;
  padding: 3px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  outline: none;
  background: #fff;
  color: #64748b;
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition:
      border-color .15s ease,
      background-color .15s ease,
      color .15s ease;
}

.pagination-select:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.pagination-select:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, .06);
}

/* Page buttons */

.page-buttons {
  display: flex;
  align-items: center;
  gap: 7px;
}

.page-num {
  min-width: 48px;
  font-size: var(--font-size-xs);
  color: #8a94a3;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.page-num .highlight {
  color: #2563eb;
  font-weight: 600;
}

.page-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  outline: none;
  background: #fff;
  color: #64748b;
  font-size: var(--font-size-xs);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition:
      color .15s ease,
      border-color .15s ease,
      background-color .15s ease,
      transform .15s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}

.page-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.page-btn:disabled {
  opacity: .35;
  cursor: not-allowed;
}

/* =========================
   Empty State
   ========================= */

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  background: #fff;
}

.empty-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border: 1px solid #e8edf3;
  border-radius: 11px;
  background: #f8fafc;
  color: #94a3b8;
}

.empty-icon svg {
  width: 22px;
  height: 22px;
}

.empty-title {
  margin-bottom: 6px;
  color: #475569;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.empty-description {
  color: #a0a9b5;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  text-align: center;
}

/* =========================
   Horizontal Scrollbar
   ========================= */

.table-container::-webkit-scrollbar {
  height: 7px;
}

.table-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #d5dce6;
  border-radius: 999px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #b8c5d6;
}

/* Firefox */

.table-container {
  scrollbar-width: thin;
  scrollbar-color: #d5dce6 #f8fafc;
}

/* =========================
   Mobile
   ========================= */

@media (max-width: 768px) {
  .table-card {
    border-radius: 10px;
  }

  .custom-table th,
  .custom-table td {
    padding: 10px 12px;
  }

  .col-index {
    width: 44px;
    min-width: 44px;
  }

  .col-filename {
    min-width: 210px;
  }

  .pagination-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 9px;
    padding: 10px 12px;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-between;
    gap: 12px;
  }

  .page-size-selector {
    flex-shrink: 0;
  }

  .page-buttons {
    margin-left: auto;
  }

  .empty-state {
    min-height: 260px;
    padding: 40px 20px;
  }
}

@media (max-width: 400px) {
  .pagination-controls {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-buttons {
    margin-left: 0;
  }
}
</style>