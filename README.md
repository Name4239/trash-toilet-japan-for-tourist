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

เปิด Terminal นี้ค้างไว้ ถ้า Backend ไม่ได้รัน หน้าเว็บจะเปิดได้แต่ Login ไม่ได้

Terminal 2:

```powershell
cd FrontEnd
npm run dev
```

เปิด `http://localhost:5173`

## บัญชีทดสอบ

สร้างหรืออัปเดตข้อมูลตัวอย่างจากโฟลเดอร์ `BackEnd`:

```powershell
npm run seed:demo
```

```text
Member: demo.member@example.com / 123456
Admin:  demo.admin@example.com / 123456
```

ถ้า Login แล้วพบ database pool timeout หรือ `RSA public key is not available client side` ให้ตรวจว่า `BackEnd/src/lib/prisma.js` มี `allowPublicKeyRetrieval: true` แล้ว Restart Backend
