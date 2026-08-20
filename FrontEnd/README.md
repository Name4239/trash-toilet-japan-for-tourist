# Trash & Toilet Japan Frontend

Frontend ใช้ React + JavaScript, Tailwind CSS, React Router, Axios, React Leaflet, OpenStreetMap, react-geolocated และ Lucide React

## Run

```powershell
npm install
npm run dev
```

เปิด `http://localhost:5173`

## Test

```powershell
npm run lint
npm run build
```

## Environment

Development ใช้ `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

Production ใช้ `.env.production` เป็น `/api` เพื่อให้ Express และ Cloudflare Tunnel ใช้ URL เดียวกัน

## ระบบหลัก

- Email/Password Login และ JWT
- Map + GPS + Marker จาก Database
- ค้นหาประเภทและระยะทาง
- เพิ่ม Place พร้อมรูป
- Report พร้อมรูปหลักฐานชั่วคราว
- Profile Avatar
- Light/Dark Theme
- หน้า Member และ Admin

ไม่มี Google Login ในเวอร์ชันปัจจุบัน
