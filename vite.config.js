import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/loaders/GLTFLoader.js',
      '@pixiv/three-vrm'
    ]
  },
  ssr: {
    noExternal: ['three', '@pixiv/three-vrm']
  }
})
