import { defineConfig } from 'vite' // defineConfig ช่วยตรวจและเติมคำแนะนำของ Vite Config
import react from '@vitejs/plugin-react' // Plugin React แปลง JSX และรองรับ Fast Refresh ตอน npm run dev
import tailwindcss from '@tailwindcss/vite' // Plugin Tailwind สร้าง Utility CSS จาก class ที่ใช้ใน Component

export default defineConfig({ // https://vite.dev/config/
  plugins: [react(), tailwindcss()], // เปิด Plugin React ก่อน แล้วให้ Tailwind ประมวลผล CSS ร่วมกับ Vite
})
