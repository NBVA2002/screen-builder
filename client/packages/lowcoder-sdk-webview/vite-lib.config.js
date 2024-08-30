import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  base: '',
  plugins: [react()],
  build: {
    lib: {
      formats: ["es"],
      entry: "./src/lib.tsx",
      name: "Lowcoder",
      fileName: "lowcoder-sdk",
    },
    rollupOptions: {
      external: ["react", "react-dom", '**/*.test.tsx'],
      output: {
        chunkFileNames: "[hash].js",
      },
      onwarn: (warning, warn) => {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      },
    },
  },
})
