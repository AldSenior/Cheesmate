import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		sourcemap: true,
	},
	esbuild: {
		// Отключаем проверку TypeScript
		tsconfigRaw: {
			compilerOptions: {
				skipLibCheck: true,
			},
		},
	},
})
