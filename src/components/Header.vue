<script setup>

</script>

<template>
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
</template>

<style scoped>
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
.titles {
  min-width: 0;
}
.titles h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -.025em;
  color: #111827;
}
.titles p {
  margin: 3px 0 0;
  font-size: var(--font-size-sm);
  line-height: 1.4;
  color: #8a94a3;
}

@media (max-width: 768px) {
  .app-header {
    margin-bottom: 14px;
  }
  .titles h1 {
    font-size: var(--font-size-xl);
  }
}
</style>