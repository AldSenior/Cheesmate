import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: '/',
	server: {
		host: '0.0.0.0', // Слушаем на всех интерфейсах
		port: 5173, // Порт, который использует Vite
		allowedHosts: [
			'cheesmate-web.onrender.com', // Разрешаем запросы с этого домена
		],
	},
})
