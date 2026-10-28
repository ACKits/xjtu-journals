<!--
  受控组件（controlled component），遵循 props 进、事件出 的模式

  父组件 ──props──► 子组件
  父组件 ◄──emit── 子组件

  数据来源：fileNames、selectedFileNames、isAllSelected 全部由父组件传入。
  状态变更：子组件不直接改 props，而是 emit 事件让父组件去改。
  本地状态：只有 dropdownOpen（下拉展开）和 dropdownRef（DOM 引用）是组件内部的。
-->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { readExcelFile } from '../utils/excel.js'

/**
 * 组件 props
 * @property {string[]} fileNames - 所有可选文件名
 * @property {string[]|null} selectedFileNames - 已选文件名（null 表示全选）
 * @property {boolean} isAllSelected - 是否处于全选状态
 * @property {boolean} disabled - 是否禁用交互
 */
const props = defineProps({
  fileNames: { type: Array, required: true },
  selectedFileNames: { required: true },
  isAllSelected: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false }
})

/**
 * 组件事件
 * - update:selectedFileNames：同步选中列表（配合 v-model）
 * - toggleAll：请求全选/取消全选
 * - toggleFile：请求切换单个文件
 * - filesLoaded：上传并解析完成后，把数据抛给父组件
 */
const emit = defineEmits([
  'update:selectedFileNames',
  'toggleAll',
  'toggleFile',
  'filesLoaded'
])

// 下拉面板是否展开
const dropdownOpen = ref(false)
// 下拉面板根元素引用，用于判断点击是否在外部
const dropdownRef = ref(null)

/**
 * 已选文件数量
 * selectedFileNames 为 null 时代表全选，数量 = 总文件数
 */
const selectedCount = computed(() => {
  return props.selectedFileNames === null ? props.fileNames.length : props.selectedFileNames.length
})

/**
 * 下拉框上显示的文案
 * 根据选中状态动态返回不同的提示文字
 */
const selectedLabel = computed(() => {
  const total = props.fileNames.length
  const selected = props.selectedFileNames
  if (!total) return '暂无文件'
  if (selected === null || selected.length === total) {
    return `全部文件（${total}）`
  }
  if (selected.length === 0) {
    return '未选择文件'
  }
  if (selected.length === 1) {
    return selected[0]
  }
  return `已选择 ${selected.length} 个文件`
})

/**
 * 判断某个文件是否被选中
 * selectedFileNames 为 null 视为全选
 * @param {string} fileName
 * @returns {boolean}
 */
function isFileSelected(fileName) {
  return props.selectedFileNames === null || props.selectedFileNames.includes(fileName)
}

/**
 * 切换下拉面板展开/收起
 */
function toggleDropdown() {
  if (props.disabled) return
  dropdownOpen.value = !dropdownOpen.value
}

/**
 * 切换单个文件的选中状态（向上抛事件，由父组件处理）
 * @param {string} file
 */
function toggleFile(file) {
  if (props.disabled) return
  emit('toggleFile', file)
}

/**
 * 全选 / 取消全选（向上抛事件）
 */
function toggleAll() {
  if (props.disabled) return
  emit('toggleAll')
}

/**
 * 处理文件上传：逐个读取 Excel，解析成功后统一抛给父组件
 * @param {Event} e - input 的 change 事件
 */
async function onFileUpload(e) {
  if (props.disabled) return
  const files = e.target.files
  if (!files.length) return
  const loaded = []
  for (const file of files) {
    try {
      const result = await readExcelFile(file)
      loaded.push(result)
    } catch (err) {
      console.error(`读取 ${file.name} 失败:`, err)
      alert(`读取文件 "${file.name}" 失败，请确保格式正确。`)
    }
  }
  if (loaded.length) emit('filesLoaded', loaded)

  // 清空 input 的值，保证同一个文件再次选择也能触发 change
  e.target.value = ''
}

/**
 * 点击外部时关闭下拉面板
 * @param {MouseEvent} e
 */
function handleOutsideClick(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

// 挂载时监听全局点击，用于点击外部关闭下拉
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

// 卸载时移除监听，避免内存泄漏
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="selector-header">
    <div class="selector-title">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h4l2 2h7A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
      <span>数据来源</span>
    </div>
    <span class="selection-count">{{ selectedCount }}/{{ fileNames.length }}</span>
  </div>
  <div ref="dropdownRef" class="dropdown">
    <button type="button" class="dropdown-trigger" :class="{ active: dropdownOpen }" :disabled="disabled" @click="toggleDropdown">
      <span class="trigger-text" :title="selectedLabel">{{ disabled ? '加载中…' : selectedLabel }}</span>
      <svg class="chevron" :class="{ rotated: dropdownOpen }" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <transition class="dropdown">
      <div v-if="dropdownOpen && !disabled" class="dropdown-menu">
        <button type="button" class="option all-option" :class="{ selected: isAllSelected }" @click="toggleAll">
            <span class="check-box" :class="{ checked: isAllSelected }">
              <svg v-if="isAllSelected" viewBox="0 0 24 24" fill="none">
                <path d="m6.5 12.5 3.5 3.5 3.5 3.5 7-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          <span class="option-content">
              <span class="option-title">全部文件</span>
              <span class="option-meta">{{ fileNames.length }} 个文件</span>
            </span>
        </button>
        <div class="menu-divider"></div>
        <div class="file-list">
          <button v-for="fileName in fileNames" :key="fileName" type="button" class="option file-option" :class="{ selected: isFileSelected(fileName) }" @click="toggleFile(fileName)">
              <span class="check-box" :class="{ checked: isFileSelected(fileName) }">
                <svg v-if="isFileSelected(fileName)" viewBox="0 0 24 24" fill="none">
                  <path d="m5.5 12.5 4 4 9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            <span class="file-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 3.5h8l4 4v13H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M14 3.5v4h4M8 12h8M8 15.5h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </span>
            <span class="file-name" :title="fileName">{{ fileName }}</span>
          </button>
          <div v-if="!fileNames.length" class="empty-files">暂无可用文件</div>
        </div>
      </div>
    </transition>
  </div>

  <div class="quick-section">
    <div class="quick-header">
      <span>快速选择</span>
      <button type="button" class="select-all-btn" :disabled="disabled" @click="toggleAll">{{ isAllSelected ? '取消全选' : '全选' }}</button>
    </div>
    <div class="quick-list">
      <button v-for="fileName in fileNames" :key="fileName" type="button" class="quick-item" :class="{ active: isFileSelected(fileName) }" :disabled="disabled" @click="toggleFile(fileName)">
          <span class="quick-check">
            <svg v-if="isFileSelected(fileName)" viewBox="0 0 24 24" fill="none">
              <path d="m5.5 12.5 4 4 9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        <span class="quick-name" :title="fileName">{{ fileName }}</span>
      </button>
    </div>
  </div>

  <div class="upload-area">
    <label for="fileUpload" class="upload-btn" :class="{ disabled }" :style="disabled ? 'pointer-events: none; opacity: 0.6;' : ''">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>加载 Excel 文件</span>
    </label>
    <input id="fileUpload" type="file" multiple accept=".xlsx,.xls" :disabled="disabled" @change="onFileUpload">
    <span class="upload-hint">支持 .xlsx / .xls</span>
  </div>
</template>

<style scoped>
.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}
.selector-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #475569;
  font-size: var(--font-size-base);
  font-weight: 600;
}
.selector-title svg {
  width: 15px;
  height: 15px;
  color: #64748b;
}
.selection-count {
  font-size: var(--font-size-xs);
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.dropdown {
  position: relative;
  width: 100%;
}
.dropdown-trigger {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 13px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  outline: none;
  background: #fff;
  color: #334155;
  font-size: var(--font-size-base);
  text-align: left;
  cursor: pointer;
  transition: border-color .16s ease, box-shadow .16s ease, background .16s ease;
}
.dropdown-trigger:hover {
  border-color: #cbd5e1;
  background: #fcfcfd;
}
.dropdown-trigger.active {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37,99,235,.07);
}
.trigger-text {
  min-width: 0;
  font-size: var(--font-size-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  color: #94a3b8;
  transition: transform .18s ease, color .18s ease;
}
.dropdown-trigger:hover .chevron,
.dropdown-trigger.active .chevron {
  color: #64748b;
}
.chevron.rotated {
  transform: rotate(180deg);
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 7px);
  left: 0;
  right: 0;
  z-index: 300;
  padding: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15,23,42,.1), 0 2px 6px rgba(15,23,42,.05);
}
.option {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 9px;
  border: 0;
  border-radius: 7px;
  outline: none;
  background: transparent;
  color: #334155;
  text-align: left;
  cursor: pointer;
  transition: background .14s ease;
}
.option:hover,
.option.selected {
  background: #f8fafc;
}
.all-option {
  min-height: 48px;
}
.option-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.option-title {
  font-size: var(--font-size-base);
  line-height: 1.4;
  color: #334155;
}
.option-meta {
  font-size: var(--font-size-xs);
  line-height: 1.3;
  color: #94a3b8;
}

.check-box {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  background: #fff;
  color: #fff;
  transition: background .14s ease, border-color .14s ease;
}
.check-box.checked {
  border-color: #2563eb;
  background: #2563eb;
}
.check-box svg {
  width: 12px;
  height: 12px;
}
.file-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}
.file-icon svg {
  width: 17px;
  height: 17px;
}
.file-option.selected .file-icon {
  color: #64748b;
}
.file-name {
  min-width: 0;
  overflow: hidden;
  font-size: var(--font-size-base);
  line-height: 1.4;
  color: #475569;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-option.selected .file-name {
  color: #1e293b;
  font-size: var(--font-size-base);
}
.menu-divider {
  height: 1px;
  margin: 5px 4px;
  background: #f1f5f9;
}
.file-list {
  max-height: 270px;
  overflow-y: auto;
  padding: 2px 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.file-list::-webkit-scrollbar {
  width: 6px;
}
.file-list::-webkit-scrollbar-track {
  background: transparent;
}
.file-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #d5dbe3;
}
.file-list::-webkit-scrollbar-thumb:hover {
  background: #b8c1cd;
}
.empty-files {
  padding: 24px 12px;
  color: #94a3b8;
  font-size: var(--font-size-base);
  text-align: center;
}

.quick-section {
  margin-top: 18px;
}
.quick-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #94a3b8;
  font-size: var(--font-size-xs);
  font-weight: 550;
}
.select-all-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
}
.select-all-btn:hover {
  color: #1d4ed8;
}
.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 105px;
  overflow-y: auto;
  padding: 1px 1px 2px;

  /* Firefox: 默认透明 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

/* Firefox: 悬停时显示 */
.quick-list:hover {
  scrollbar-color: #cbd5e1 transparent;
}

/* WebKit (Chrome / Edge / Safari): 默认不占空间 */
.quick-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.quick-list::-webkit-scrollbar-track {
  background: transparent;
}

.quick-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: transparent;
  transition: background .2s ease;
}

/* 悬停时显示滑块颜色 */
.quick-list:hover::-webkit-scrollbar-thumb {
  background: #d5dbe3;
}

.quick-list:hover::-webkit-scrollbar-thumb:hover {
  background: #b8c1cd;
}

.quick-item {
  max-width: 100%;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 9px 4px 7px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: border-color .14s ease, background .14s ease, color .14s ease;
}
.quick-item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.quick-item.active {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}
.quick-check {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  color: #fff;
}
.quick-item.active .quick-check {
  border-color: #2563eb;
  background: #2563eb;
}
.quick-check svg {
  width: 11px;
  height: 11px;
}
.quick-name {
  min-width: 0;
  max-width: 220px;
  overflow: hidden;
  font-size: var(--font-size-xs);
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid #f1f3f5;
}
.upload-area input {
  display: none;
}
.upload-btn {
  min-height: 31px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #fff;
  color: #475569;
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: border-color .14s ease, background .14s ease, color .14s ease;
}
.upload-btn svg {
  width: 14px;
  height: 14px;
}
.upload-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #2563eb;
}
.upload-hint {
  color: #a0a9b5;
  font-size: var(--font-size-xs);
}

@media (max-width: 768px) {
  .file-list {
    max-height: 220px;
  }
  .quick-list {
    max-height: 100px;
  }
  .quick-name {
    max-width: 180px;
  }
}
.dropdown-trigger:disabled,
.quick-item:disabled,
.select-all-btn:disabled,
.dropdown-trigger:disabled:hover {
  border-color: #e2e8f0;
  background: #fff;
}
.quick-item:disabled:hover {
  border-color: #e5e7eb;
  background: #fff;
}
.upload-btn.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>