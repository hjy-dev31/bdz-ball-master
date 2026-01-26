import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/bdz-ball-master/', // 여러분의 GitHub 저장소(Repository) 이름을 슬래시 사이에 넣으세요.
})