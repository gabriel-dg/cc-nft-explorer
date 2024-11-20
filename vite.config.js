import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'process.env.ALCHEMY_API_KEY': JSON.stringify(env.ALCHEMY_API_KEY),
      'process.env.NETWORK': JSON.stringify(env.NETWORK),
      'process.env.CONTRACT_ADDRESS': JSON.stringify(env.CONTRACT_ADDRESS)
    },
    resolve: {
      alias: {
        buffer: 'buffer/'
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    }
  }
})
