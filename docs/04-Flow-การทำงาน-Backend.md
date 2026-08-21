# คู่มือการทำงานของระบบ Backend

คู่มือนี้อธิบายว่าโค้ดส่วนใดเกิดก่อน–หลัง และแต่ละไฟล์เชื่อมกันอย่างไร

## 1. ตอนเริ่ม Server อะไรเกิดขึ้นก่อน

เมื่อรัน:

```powershell
npm run dev
```

ระบบทำงานตามลำดับนี้:

```text
package.json
→ node --watch src/server.js
→ server.js โหลด .env
→ server.js import Routes
→ Routes import Middleware, Zod Schemas และ Controllers
→ Controllers import lib/prisma.js
→ lib/prisma.js สร้างการเชื่อมต่อ MariaDB
→ server.js เริ่มฟัง request ที่ PORT
```

### `package.json`

หน้าที่:

- เก็บรายชื่อ packages เช่น Express, Prisma, bcrypt, JWT, Zod และ Multer
- `npm run dev` เรียก `node --watch src/server.js`
- `npm run test:api` เรียกชุดทดสอบ API

ไฟล์ JSON ใส่ comment ไม่ได้ เพราะจะทำให้ npm อ่านไม่ออก

### `.env`

หน้าที่:

- เก็บ PORT
- เก็บข้อมูลเชื่อมต่อ MariaDB
- เก็บ `JWT_SECRET`
- อาจเก็บ `FRONTEND_URL`

ไฟล์นี้เกิดก่อน Logic ทั้งหมด เพราะ `server.js` และ `lib/prisma.js` โหลดค่าจากไฟล์นี้

### `prisma.config.ts`

หน้าที่:

- ใช้ตอนรันคำสั่ง Prisma CLI
- บอกตำแหน่ง `schema.prisma` และ migrations
- อ่าน `DATABASE_URL` จาก `.env`

ไฟล์นี้ไม่ได้รับ HTTP request และไม่ทำงานใน Route

### `prisma/schema.prisma`

หน้าที่:

- กำหนดตาราง User, Place และ Report
- กำหนด enum ของ role, type และ status
- กำหนดความสัมพันธ์และ Foreign Key
- ใช้สร้าง migrations และ Prisma Client

ไฟล์นี้เป็นแบบแปลน Database ไม่ใช่ Controller

### `generated/prisma/`

หน้าที่:

- Prisma สร้างให้อัตโนมัติจาก `schema.prisma`
- `lib/prisma.js` import Prisma Client จากโฟลเดอร์นี้
- ไม่ควรแก้ไฟล์ในนี้ด้วยตนเอง

เมื่อแก้ Schema ให้รัน:

```powershell
npx prisma migrate dev --name ชื่อการแก้ไข
npx prisma generate
```

## 2. จุดเริ่ม HTTP Request

### `src/server.js`

ไฟล์นี้ทำงานตามลำดับ:

1. โหลด `.env`
2. import Express และ Routes
3. สร้าง `app`
4. ตั้งค่า CORS ให้ React เรียก API ได้
5. เปิดการอ่าน JSON Body
6. เชื่อม URL หลักกับ Route แต่ละไฟล์
7. สร้าง Health Route `/`
8. สร้าง 404 Handler
9. เริ่ม Server ด้วย `app.listen()`

ตัวอย่าง:

```text
/api/auth    → authRoutes.js
/api/users   → userRoutes.js
/api/places  → placeRoutes.js
/api/reports → reportRoutes.js
```

Request ทุกตัวต้องผ่าน `server.js` ก่อนเสมอ

## 3. Route ทำอะไร

Route มีหน้าที่จับคู่ Method + URL แล้วเรียกฟังก์ชันจากซ้ายไปขวา

ตัวอย่าง:

```javascript
router.post("/", authMiddleware, validate(createPlaceSchema), createPlace);
```

ลำดับคือ:

```text
POST /api/places
→ authMiddleware
→ validate(createPlaceSchema)
→ createPlace Controller
```

### `src/routes/authRoutes.js`

- รับ `/register` และ `/login`
- Zod ตรวจ Body ก่อน
- ส่งต่อไป `authController.js`

### `src/routes/userRoutes.js`

- รับ `/me`
- ตรวจ JWT ด้วย `authMiddleware`
- ส่งต่อไป `userController.js`

### `src/routes/placeRoutes.js`

- รับ Places API ทั้งหมด
- Public Route ใช้ดู active places, nearby และ detail
- Login Route ใช้เพิ่ม Place
- Admin Route ใช้ดู pending, เปลี่ยน status และลบ Place
- Route `/nearby` และ `/pending` ต้องอยู่ก่อน `/:id`

### `src/routes/reportRoutes.js`

- Login User ส่ง Report ได้
- Admin เท่านั้นที่อ่านรายละเอียดและเปลี่ยนสถานะ Report

## 4. Middleware ทำอะไร

Middleware ทำงานระหว่าง Route และ Controller

### `src/middlewares/authMiddleware.js`

ลำดับ:

```text
รับ Authorization Header
→ ตรวจว่ามี Bearer Token
→ jwt.verify ด้วย JWT_SECRET
→ สร้าง req.user
→ next()
```

ถ้า Token ผิด ระบบหยุดตรงนี้และตอบ `401`

ไฟล์นี้มี `optionalAuthMiddleware` ด้วย:

- ไม่มี Token ก็ผ่านได้
- ถ้ามี Token จะตรวจและสร้าง `req.user`
- ใช้กับ `GET /api/places` เพราะคนทั่วไปดู active ได้ แต่ Admin ขอ `status=all` ได้

### `src/middlewares/adminMiddleware.js`

เกิดหลัง `authMiddleware`:

```text
อ่าน req.user.role
→ ถ้าไม่ใช่ admin ตอบ 403
→ ถ้าใช่ admin เรียก next()
```

### `src/middlewares/validateMiddleware.js`

รับ Zod Schema จาก Route แล้วทำงานดังนี้:

```text
schema.safeParse(body/query/params)
→ ไม่ผ่าน: ตอบ 400 พร้อม errors
→ ผ่าน: เก็บข้อมูลที่ตรวจแล้ว
→ next() ไป Controller
```

Controller จึงได้รับข้อมูลที่ผ่านกติกาแล้ว

### `src/middlewares/uploadMiddleware.js`

ทำงานเฉพาะ `POST /api/places` หลัง Auth และก่อน Zod:

```text
รับ multipart/form-data field ชื่อ image
→ ตรวจว่าเป็นรูปและขนาดไม่เกิน 5 MB
→ ตั้งชื่อใหม่และบันทึกใน BackEnd/uploads
→ เก็บข้อมูลไฟล์ไว้ใน req.file
→ ส่งต่อให้ Zod ตรวจข้อความ
```

ถ้า Zod ไม่ผ่าน ระบบจะลบไฟล์ที่เพิ่งอัปโหลดเพื่อไม่ให้มีไฟล์ขยะ

## 5. Zod Schemas ทำอะไร

### `src/validations/schemas.js`

ไฟล์นี้มีแต่กติกาข้อมูล ไม่มีการเรียก Database

- `registerSchema` ตรวจ name/email/password
- `loginSchema` ตรวจ email/password
- `placeIdSchema` ตรวจ Place ID
- `createPlaceSchema` ตรวจข้อมูลสร้าง Place และพิกัด
- `placesQuerySchema` ตรวจ Filter/Search
- `nearbyQuerySchema` ตรวจ GPS และ radius
- `placeStatusSchema` ตรวจสถานะ Place
- `createReportSchema` ตรวจข้อมูล Report
- `reportsQuerySchema` ตรวจ Filter ของ Report
- `reportIdSchema` ตรวจ Report ID
- `reportStatusSchema` รับเฉพาะ resolved/rejected

Zod เกิดก่อน Controller แต่หลัง Auth ใน Route ที่ต้อง Login

## 6. Controller ทำอะไร

Controller เป็นจุดที่มี Business Logic และเรียก Prisma

### `src/controllers/authController.js`

Register:

```text
รับข้อมูลที่ Zod ตรวจแล้ว
→ ค้นหา email ซ้ำ
→ bcrypt.hash password
→ prisma.user.create
→ ส่ง User ที่ไม่มี password กลับ
```

Login:

```text
ค้นหา User
→ bcrypt.compare password
→ jwt.sign สร้าง Token
→ ส่ง Token กลับ
```

### `src/controllers/userController.js`

```text
รับ userId จาก req.user
→ prisma.user.findUnique
→ เลือกเฉพาะ id/name/email/role
→ ส่ง Profile กลับ
```

### `src/controllers/placeController.js`

- `getPlaces` คืน active เป็นค่าเริ่มต้น
- `getNearbyPlaces` ดึง active แล้วคำนวณระยะทาง
- `getPlaceById` คืนรายละเอียด Place
- `createPlace` บังคับให้มีรูป ตั้ง Member เป็น pending/Admin เป็น active และเก็บ `imageUrl`
- `getPendingPlaces` คืนคำขอรอ Admin
- `updatePlaceStatus` เปลี่ยนสถานะโดย Admin
- `deletePlace` ลบ Place โดย Admin

### `src/controllers/reportController.js`

- `createReport` บังคับ Report ใหม่เป็น pending
- `getReports` ให้ Admin ดูรายการ
- `getReportById` ให้ Admin ดูรายละเอียด
- `updateReportStatus` รับเฉพาะ resolved/rejected

Controller ทุกตัวใช้ `try/catch` เพื่อเปลี่ยน error ที่ไม่คาดคิดเป็น Response `500`

## 7. Prisma ติดต่อ Database อย่างไร

### `src/lib/prisma.js`

ลำดับ:

```text
อ่านค่าจาก .env
→ สร้าง PrismaMariaDb adapter
→ สร้าง PrismaClient
→ export prisma
```

ในโปรเจกต์นี้ adapter มี `allowPublicKeyRetrieval: true` เพื่อให้เชื่อมต่อ MySQL 8 ที่ใช้ `caching_sha2_password` ในเครื่องพัฒนาได้ หากขาดค่านี้ request ที่ต้องอ่าน Database เช่น Login อาจจบด้วย `RSA public key is not available client side` และ pool timeout

Controller เรียกคำสั่ง เช่น:

```text
prisma.user.findUnique  → SELECT User
prisma.place.create     → INSERT Place
prisma.report.update    → UPDATE Report
prisma.place.delete     → DELETE Place
```

เมื่อ Database ตอบ Prisma จะคืน JavaScript object ให้ Controller

## 8. Response ย้อนกลับอย่างไร

ลำดับขากลับ:

```text
MariaDB
→ Prisma คืน object
→ Controller สร้าง res.json(...)
→ Express ส่ง HTTP Response
→ Axios/Postman ได้ JSON
```

ตัวอย่าง Status Code:

- `200` อ่านหรือแก้ข้อมูลสำเร็จ
- `201` สร้างข้อมูลสำเร็จ
- `400` Zod หรือข้อมูลไม่ถูกต้อง
- `401` ไม่มี Token หรือ Token ผิด
- `403` ไม่มีสิทธิ์ Admin
- `404` ไม่พบข้อมูลหรือ Route
- `409` Email ซ้ำ
- `500` Server/Database เกิดข้อผิดพลาด

## 9. Flow สำคัญทั้งระบบ

### Member เพิ่มสถานที่

```text
Frontend POST /api/places
→ server.js
→ placeRoutes.js
→ authMiddleware ตรวจ Token
→ Multer รับ image และเก็บใน uploads
→ createPlaceSchema ตรวจ Body
→ validateMiddleware
→ placeController.createPlace
→ เห็น role member จึงตั้ง pending
→ Prisma INSERT Place พร้อม imageUrl
→ ส่ง 201 กลับ Frontend
```

เมื่อเปิด Marker, Card หรือ Detail Frontend จะโหลดรูปผ่าน `/uploads/ชื่อไฟล์`

### Admin เพิ่มสถานที่

เหมือน Member แต่ Controller เห็น role `admin` จึงตั้ง `active` ทันที

### Admin อนุมัติ Place

```text
PATCH /api/places/:id/status
→ authMiddleware
→ adminMiddleware
→ placeIdSchema
→ placeStatusSchema
→ updatePlaceStatus
→ Prisma UPDATE
```

### Map โหลด Marker

```text
GET /api/places
→ optionalAuthMiddleware
→ placesQuerySchema
→ getPlaces
→ Prisma SELECT status=active
→ Frontend สร้าง Marker จากข้อมูลที่ได้
```

OpenStreetMap ไม่ได้ส่ง Marker มาให้ระบบ แต่เป็นเพียงพื้นแผนที่

### GPS ค้นหาสถานที่ใกล้ตัว

```text
react-geolocated ได้ตำแหน่งมือถือ
→ Frontend ส่ง latitude/longitude
→ nearbyQuerySchema ตรวจพิกัด
→ getNearbyPlaces
→ ดึง active Places
→ คำนวณระยะทาง
→ ส่งสถานที่ใน radius กลับ
```

### Member ส่ง Report

```text
POST /api/reports
→ authMiddleware
→ uploadReportEvidence รับ field evidence
→ createReportSchema
→ createReport
→ ตรวจว่า Place มีจริง
→ บังคับ pending
→ Prisma INSERT Report พร้อม evidenceImageUrl
```

### Admin จัดการ Report

```text
PATCH /api/reports/:id/status
→ authMiddleware
→ adminMiddleware
→ reportIdSchema + reportStatusSchema
→ updateReportStatus
→ Prisma UPDATE resolved/rejected
→ ลบไฟล์รูปหลักฐานชั่วคราว
```

ถ้า Admin ดำเนินการลบ Place ระบบจะลบ Place, รูปสถานที่, Reports แบบ Cascade และรูปหลักฐานของ Reports ด้วย

## 10. ไฟล์สำหรับทดสอบและเอกสารที่เกี่ยวข้อง

### `tests/apiSmokeTest.js`

- จำลอง User และ Admin
- เรียก API ตาม Flow จริง
- ตรวจสถานะและสิทธิ์
- ลบข้อมูลทดสอบของตัวเองเมื่อจบ
- ไม่ทำงานตอน `npm run dev`

### `postman/Trash-Toilet-Japan.postman_collection.json`

- Import เข้า Postman เพื่อทดสอบ API ทีละ Request
- เก็บ Member/Admin Token เป็น Collection Variables
- เก็บ `placeId` และ `reportId` จาก Response

- [ตั้งค่าและรันโปรเจกต์](01-ตั้งค่าและรันโปรเจกต์.md) — คำสั่ง Run และ Test
- [ลำดับอ่านโค้ด Backend](03-ลำดับอ่านโค้ด-Backend.md) — ลำดับไฟล์และจุดสำคัญ
- [API Reference](06-API-Reference.md) — Method, URL, สิทธิ์ และข้อมูลที่ API รับ

## สรุปที่ควรจำ

```text
เปิด Server:
package.json → server.js → Routes พร้อมรับ Request

Request ทั่วไป:
Server → Route → Zod → Controller → Prisma → MariaDB

Request ที่ต้อง Login:
Server → Route → Auth → Zod → Controller → Prisma → MariaDB

Request ของ Admin:
Server → Route → Auth → Admin → Zod → Controller → Prisma → MariaDB
```
