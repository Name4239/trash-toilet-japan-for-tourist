# Trash & Toilet Japan

## ลำดับอ่านเอกสาร

อ่านตามหมายเลขนี้ได้เลย:

1. [ตั้งค่าและรันโปรเจกต์](docs/01-ตั้งค่าและรันโปรเจกต์.md)
2. [ภาพรวมและสถาปัตยกรรมระบบ](docs/02-ภาพรวมและสถาปัตยกรรมระบบ.md)
3. [ลำดับอ่านโค้ด Backend](docs/03-ลำดับอ่านโค้ด-Backend.md)
4. [Flow การทำงาน Backend](docs/04-Flow-การทำงาน-Backend.md)
5. [ลำดับอ่านโค้ด Frontend](docs/05-ลำดับอ่านโค้ด-Frontend.md)
6. [API Reference](docs/06-API-Reference.md)

`FrontEnd/README.md` เป็นคู่มือคำสั่งเฉพาะ Frontend แบบสั้น ไม่จำเป็นต้องอ่านตามลำดับด้านบน

## ลำดับอ่าน Source Code

### รอบที่ 1: Database และ Backend

```text
BackEnd/prisma/schema.prisma
→ BackEnd/src/server.js
→ BackEnd/src/routes/
→ BackEnd/src/middlewares/
→ BackEnd/src/validations/schemas.js
→ BackEnd/src/controllers/
→ BackEnd/src/lib/prisma.js
```

อ่านละเอียดได้ที่:

- [ลำดับอ่านโค้ด Backend](docs/03-ลำดับอ่านโค้ด-Backend.md)
- [Flow การทำงาน Backend](docs/04-Flow-การทำงาน-Backend.md)

### รอบที่ 2: Frontend

```text
FrontEnd/src/main.jsx
→ FrontEnd/src/App.jsx
→ FrontEnd/src/hooks/AuthProvider.jsx
→ FrontEnd/src/layouts/AppLayout.jsx
→ FrontEnd/src/pages/
→ FrontEnd/src/components/
→ FrontEnd/src/services/api.js
```

อ่านละเอียดได้ที่ [ลำดับอ่านโค้ด Frontend](docs/05-ลำดับอ่านโค้ด-Frontend.md)

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

## วิธีตรวจงาน

Backend:

```powershell
cd BackEnd
npm run test:api
```

Frontend:

```powershell
cd FrontEnd
npm run lint
npm run build
```

## สิ่งที่ควรจำ

- Member เพิ่ม Place → `pending`
- Admin เพิ่ม Place → `active`
- Map แสดงเฉพาะ `active`
- Report ใหม่ → `pending`
- Report ต้องแนบรูปหลักฐานชั่วคราว และ Admin เห็นรูปก่อนจัดการ
- เมื่อ Report จบหรือ Place ถูกลบ รูปหลักฐานจะถูกลบออกจาก `uploads`
- Admin เปลี่ยน Report → `resolved` หรือ `rejected`
- GPS มาจาก `react-geolocated`
- รูปมาจากกล้อง/คลังรูป ส่งด้วย FormData และ Multer
- ไฟล์รูปเก็บใน `BackEnd/uploads` ส่วน URL อยู่ใน `Place.imageUrl`, `User.avatarUrl` หรือ `Report.evidenceImageUrl`
- Login ใช้ Email/Password เท่านั้น (นำ Google Login ออกจากระบบแล้ว)
- Marker มาจาก MariaDB ผ่าน Backend
- OpenStreetMap เป็นพื้นแผนที่
