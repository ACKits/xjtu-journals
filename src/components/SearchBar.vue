<template>
  <div class="search-bar-wrap">
    <div class="section-label">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="1.6"/>
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      <span>搜索</span>
    </div>
    <div class="search-input-wrap">
      <input
          id="searchInput"
          type="text"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="输入关键词搜索 Excel 数据..."
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.search-bar-wrap {
  flex: 2 1 280px;
  min-width: 200px;
}
.section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.section-label svg {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}
.search-input-wrap {
  position: relative;
  width: 100%;
}
.search-input-wrap input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  color: #374151;
  font-size: 13px;
  line-height: 1;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.search-input-wrap input::placeholder {
  color: #9ca3af;
}
.search-input-wrap input:hover {
  border-color: #d1d5db;
}
.search-input-wrap input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
@media (max-width: 768px) {
  .search-bar-wrap {
    min-width: 0;
  }
  .search-input-wrap input {
    height: 40px;
  }
}
</style>