# คู่มือทำความเข้าใจ Backend

คู่มือนี้ใช้สำหรับอ่านโค้ดตามลำดับ ไม่จำเป็นต้องอ่านทุกไฟล์พร้อมกัน

> เลขบรรทัดอ้างอิงโค้ดปัจจุบัน หากมีการเพิ่มหรือลบโค้ด ให้ค้นหาชื่อฟังก์ชันแทน

## ภาพรวมการเดินทางของ Request

```text
Postman / Frontend
→ server.js
→ routes
→ middleware (ถ้า Route นั้นต้องตรวจสิทธิ์)
→ Multer upload (Place, Avatar หรือหลักฐาน Report)
→ Zod validation
→ controller
→ lib/prisma.js
→ MariaDB
→ ส่ง JSON ย้อนกลับไป Frontend
```

## รอบแรก: อ่านภาพรวม

### 1. เริ่มที่ `src/server.js`

- บรรทัด 1–13: import และสร้าง Express app
- บรรทัด 17–28: CORS อนุญาตให้ Frontend เรียก Backend
- บรรทัด 31: ทำให้ Express อ่าน JSON Body
- บรรทัด 34–37: ดูว่า URL แต่ละกลุ่มไป Route ไฟล์ใด
- บรรทัด 40–47: Health check และ 404
- บรรทัด 50: เริ่ม Server

ยังไม่ต้องจำรายละเอียด ให้เข้าใจว่า `server.js` เป็นประตูหน้าเท่านั้น

### 2. อ่าน `prisma/schema.prisma`

- บรรทัด 5: ตำแหน่งสร้าง Prisma Client
- บรรทัด 11: Database ใช้ MySQL connector สำหรับ MariaDB
- บรรทัด 16–38: ค่าที่อนุญาตของ role, type และ status
- บรรทัด 41: ตาราง User
- บรรทัด 54: ตาราง Place
- บรรทัด 76: ตาราง Report

ให้สังเกต `createdById`, `reporterId` และ `placeId` เพราะเป็นตัวเชื่อมตาราง

### 3. อ่าน `src/lib/prisma.js`

- บรรทัด 1–7: import และคำอธิบาย
- บรรทัด 9: สร้าง MariaDB adapter จาก `.env`
- บรรทัด 19: สร้าง Prisma Client

Controller ทุกตัว import `prisma` จากไฟล์นี้เพื่อคุยกับ Database

## รอบสอง: อ่าน Authentication Flow

อ่านตามลำดับนี้:

```text
server.js บรรทัด 34
→ routes/authRoutes.js บรรทัด 11–12
→ validations/schemas.js
→ middlewares/validateMiddleware.js
→ controllers/authController.js
→ lib/prisma.js
→ schema.prisma model User
```

### Register

อ่าน `controllers/authController.js` บรรทัด 9–54:

1. รับ `name`, `email`, `password`
2. ตรวจข้อมูลว่าง
3. ค้นหา email ซ้ำ
4. ใช้ bcrypt hash password
5. Prisma สร้าง User
6. ส่งข้อมูลผู้ใช้กลับโดยไม่ส่ง password

### Login

อ่าน `controllers/authController.js` ตั้งแต่บรรทัด 57:

1. รับ email/password
2. ค้นหา User
3. bcrypt เปรียบเทียบ password
4. JWT สร้าง Token ที่มี `userId` และ `role`
5. ส่ง Token กลับ Frontend

## รอบสาม: อ่านระบบสิทธิ์

### Login protection

อ่าน `middlewares/authMiddleware.js` บรรทัด 7:

```text
รับ Authorization Header
→ แยก Bearer Token
→ jwt.verify
→ เก็บข้อมูลใน req.user
→ next() ไปขั้นถัดไป
```

อ่านบรรทัด 28 สำหรับ `optionalAuthMiddleware` ซึ่งยอมให้คนทั่วไปผ่านได้ แต่จะอ่าน Token ถ้ามีส่งมา

### Admin protection

อ่าน `middlewares/adminMiddleware.js` บรรทัด 4:

```text
รับ req.user จาก authMiddleware
→ ตรวจ role === admin
→ next() ไป Controller
```

## รอบสี่: อ่าน Places Flow

เริ่ม `routes/placeRoutes.js` บรรทัด 32–58 แล้วเลือก Route ที่ต้องการศึกษา

| Route | Controller ที่อ่านต่อ |
|---|---|
| `GET /nearby` | `placeController.js` บรรทัด 61 |
| `GET /pending` | บรรทัด 157 |
| `GET /` | บรรทัด 26 |
| `GET /:id` | บรรทัด 98 |
| `POST /` | บรรทัด 120 |
| `PATCH /:id/status` | บรรทัด 175 |
| `DELETE /:id` | บรรทัด 203 |

ตัวอย่าง Member เพิ่ม Place:

```text
placeRoutes.js:37
→ authMiddleware.js
→ uploadReportEvidence รับรูปจาก field evidence
→ uploadMiddleware.js รับรูป
→ schemas.js:createPlaceSchema
→ validateMiddleware.js:3
→ placeController.js:120
→ ตรวจ req.user.role
→ member = pending / admin = active
→ prisma.place.create พร้อม imageUrl
```

## รอบห้า: อ่าน Reports Flow

เริ่ม `routes/reportRoutes.js` บรรทัด 24–49

| Route | Controller ที่อ่านต่อ |
|---|---|
| `POST /` | `reportController.js` บรรทัด 9 |
| `GET /` | บรรทัด 46 |
| `GET /:id` | บรรทัด 71 |
| `PATCH /:id/status` | บรรทัด 99 |

ตัวอย่าง Member ส่ง Report:

```text
reportRoutes.js:24
→ authMiddleware.js:7
→ schemas.js:createReportSchema
→ validateMiddleware.js:3
→ reportController.js:createReport
→ ตรวจ Place ว่ามีจริง
→ บังคับ status = pending
→ prisma.report.create
```

Report จะเก็บ `evidenceImageUrl` ชั่วคราว เพื่อให้ Admin ดูรูปก่อนตัดสินใจ เมื่อ Report ถูกจัดการหรือ Place ถูกลบ ไฟล์รูปหลักฐานจะถูกลบ

## รอบหก: อ่าน Profile

```text
server.js:35
→ userRoutes.js:10
→ authMiddleware.js:7
→ userController.js:6
→ prisma.user.findUnique
```

`GET /users/me` เลือก `id`, `name`, `email`, `role`, `avatarUrl` และไม่ส่ง password กลับ ส่วน `PATCH /users/me/avatar` ใช้ Multer รับ field `avatar`

## อ่าน Zod Validation

อ่านหลัง Middleware และก่อน Controller:

1. `src/validations/schemas.js` — กำหนดว่าแต่ละ API รับ field และชนิดข้อมูลอะไร
2. `src/middlewares/validateMiddleware.js` บรรทัด 3 — ใช้ `safeParse()` ตรวจข้อมูล
3. ถ้าไม่ผ่านจะตอบ `400` พร้อม `errors`
4. ถ้าผ่านจะเรียก `next()` เพื่อไป Controller

ตัวอย่าง Register:

```text
authRoutes.js:11
→ registerSchema ตรวจ name/email/password
→ validateMiddleware
→ authController.register
```

## รอบสุดท้าย: อ่านชุดทดสอบ

เปิด `tests/apiSmokeTest.js` แล้วเริ่มที่ `runTests()` บรรทัด 51

ไฟล์นี้จำลอง Flow จริงตามลำดับ:

1. Register Member/Admin
2. Login และรับ Token
3. ดู Profile
4. Member เพิ่ม Place
5. ตรวจว่า Member เข้า Admin API ไม่ได้
6. Admin อนุมัติ Place
7. ตรวจ Map และ Nearby
8. Member ส่ง Report
9. Admin resolve Report
10. Admin ลบ Place
11. Cleanup ข้อมูลทดสอบ

รันด้วย:

```powershell
npm run test:api
```

## วิธีอ่านเมื่อเจอสิ่งที่ไม่เข้าใจ

1. ดู URL ใน `server.js`
2. หา Route ที่ตรงกันใน `src/routes`
3. อ่าน Middleware และ Zod Schema จากซ้ายไปขวา
4. เปิดฟังก์ชัน Controller ชื่อเดียวกับใน Route
5. ดูคำสั่ง `prisma.user`, `prisma.place` หรือ `prisma.report`
6. กลับไปดู Model นั้นใน `schema.prisma`

ไม่จำเป็นต้องจำโค้ดทั้งหมด ให้จำเส้นทาง `Server → Route → Auth → Validation → Controller → Prisma → Database` ก่อน
