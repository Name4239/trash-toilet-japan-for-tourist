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

## วิธีติดตั้งและเปิดโปรเจกต์บนเครื่องใหม่

### 1. ติดตั้งโปรแกรมที่จำเป็น

- [Node.js](https://nodejs.org/) รุ่น LTS
- MariaDB หรือ MySQL
- Git

### 2. Clone โปรเจกต์และติดตั้ง Dependencies

```powershell
git clone https://github.com/Name4239/trash-toilet-japan-for-tourist.git
cd trash-toilet-japan-for-tourist

cd BackEnd
npm install

cd ../FrontEnd
npm install
```

### 3. สร้างไฟล์ `.env`

```powershell
Copy-Item BackEnd/.env.example BackEnd/.env
Copy-Item FrontEnd/.env.example FrontEnd/.env
```

แก้ `BackEnd/.env` ให้ตรงกับฐานข้อมูลของเครื่อง โดยเฉพาะ `DATABASE_URL`,
`DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` และตั้ง `JWT_SECRET`
เป็นข้อความสุ่มที่ยาวและคาดเดายาก

Frontend ควรเชื่อมต่อ Backend ด้วยค่านี้:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. เตรียมฐานข้อมูล

สร้างฐานข้อมูล MariaDB/MySQL ตามชื่อที่กำหนดใน `BackEnd/.env` แล้วรัน:

```powershell
cd BackEnd
npx prisma generate
npx prisma db push
```

### 5. เปิด Backend

```powershell
cd BackEnd
npm run dev
```

Backend จะทำงานที่ `http://localhost:3000` ให้เปิด Terminal นี้ค้างไว้

### 6. เปิด Frontend

เปิด Terminal ใหม่ แล้วรัน:

```powershell
cd FrontEnd
npm run dev
```

จากนั้นเปิด `http://localhost:5173`

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

## เตรียมบัญชี Admin สำหรับทดสอบ

สมัครสมาชิกจากหน้า Register ก่อน จากนั้นรัน `npx prisma studio` ในโฟลเดอร์ `BackEnd` แล้วเปลี่ยนค่า `role` ของบัญชีนั้นจาก `member` เป็น `admin`.

