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

<script setup>
import { ref, computed, watch } from 'vue'

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

// 计算总页数
const totalPages = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.ceil(props.data.length / pageSize.value)
})

// 监听数据源或每页条数变化，重置到第一页
watch([() => props.data, pageSize], () => {
  currentPage.value = 1
})

// 过滤出当前页展示的数据切片
const paginatedData = computed(() => {
  if (!props.data) return []
  const start = (currentPage.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

function getSourceFile(row) {
  if (!row) return '未知文件'
  return row._sourceFile || row.fileName || row._fileName || row['来源文件'] || '未知文件'
}

function formatCellValue(value) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  return String(value)
}
</script>

<style scoped>
.result-table-wrapper {
  width: 100%;
}

/* 新增的卡片外框，包裹表格和底部分页 */
.table-card {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  overflow: hidden; /* 防止子元素突圆角 */
  display: flex;
  flex-direction: column;
}

/* 仅包含 table 的容器，只负责表格横向滚动 */
.table-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

.custom-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
  font-size: 13px;
  color: #374151;
}

.custom-table th,
.custom-table td {
  padding: 11px 14px;
  text-align: left;
  border-bottom: 1px solid #f1f3f5;
  word-break: normal;
  white-space: nowrap;
  vertical-align: middle;
}

.custom-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.custom-table tbody tr {
  transition: background-color 0.15s ease;
}

.custom-table tbody tr:hover td {
  background: #f8fafc;
}

.custom-table td {
  color: #374151;
  line-height: 1.55;
}

.col-index {
  width: 50px;
  min-width: 50px;
  text-align: center !important;
  color: #9ca3af !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

.col-filename {
  min-width: 240px;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #64748b;
}

.file-icon {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
  color: #94a3b8;
}

.file-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 分页控制栏样式（固定在卡片底部） ========== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0; /* 防止被压缩 */
}

.pagination-info .highlight {
  font-weight: 600;
  color: #374151;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-select {
  padding: 3px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  color: #374151;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.pagination-select:hover {
  border-color: #9ca3af;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-num {
  font-size: 12px;
}

.page-num .highlight {
  font-weight: 600;
  color: #374151;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.page-btn:hover:not(:disabled) {
  border-color: #9ca3af;
  background-color: #f1f3f5;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ========== 空状态样式 ========== */
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  background: #fff;
}

.empty-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  color: #64748b;
}

.empty-icon svg {
  width: 23px;
  height: 23px;
}

.empty-title {
  margin-bottom: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.empty-description {
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .table-card {
    border-radius: 10px;
  }
  .custom-table {
    font-size: 12px;
  }
  .custom-table th,
  .custom-table td {
    padding: 10px 12px;
  }
  .col-filename {
    min-width: 210px;
  }
  .pagination-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }
  .empty-state {
    min-height: 260px;
    padding: 40px 20px;
  }
}
</style>