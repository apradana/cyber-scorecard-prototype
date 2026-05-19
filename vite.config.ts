import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Recognise PIE web components if/when added later (`<pie-button>` etc.)
          isCustomElement: (tag) => tag.startsWith('pie-'),
        },
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
})
