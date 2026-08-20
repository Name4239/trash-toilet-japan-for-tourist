# Trash & Toilet Japan

## Flow ทั้งระบบ

```text
ผู้ใช้กดปุ่มใน React Page
→ Page เรียก api.js (Axios)
→ Backend server.js
→ Route
→ Auth/Admin Middleware
→ Multer รับรูป (Place, Avatar หรือหลักฐาน Report)
→ Zod Validation
→ Controller
→ Prisma
→ MariaDB
→ JSON กลับ Axios
→ React อัปเดตหน้าจอ
```

## วิธีเปิดทั้งโปรเจกต์

Terminal 1:

```powershell
cd BackEnd
npm run dev
```

Terminal 2:

```powershell
cd FrontEnd
npm run dev
```

เปิด `http://localhost:5173`
