import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/xjtu-journals/',
  assetsInclude: ['**/*.xlsx', '**/*.xls'], // 将 Excel 文件视为静态资源
  plugins: [vue()],
})
