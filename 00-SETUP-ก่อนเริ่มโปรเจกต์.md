# คู่มือ Setup ก่อนเริ่มโปรเจกต์

ไฟล์นี้เป็นจุดเริ่มร่วมของทั้งสองเส้นทาง ทำ Setup จากบนลงล่างให้ครบก่อน แล้วเลือกเรียนเพียงเส้นทางเดียว:

```text
เส้นทางปกติ:  00 → 01 → 02 → 03 → 04 → เว็บที่รันได้
เส้นทางพิเศษ: 00 → 05               → เว็บที่รันได้
```

เส้นทางปกติใช้ `01` เป็นลำดับสร้างระบบ, `02` ช่วยหยิบโค้ดเฉลย, `03` ช่วยดูความสัมพันธ์ของไฟล์ และ `04` ตรวจงาน ส่วน `05` รวมทุกอย่างไว้ในไฟล์เดียวและไม่ต้องเปิด `01–04` ระหว่างทำ

## สิ่งที่ต้องติดตั้งในเครื่อง

ต้องมีโปรแกรมเหล่านี้ก่อน:

1. Node.js — ใช้รัน JavaScript, Backend และ Frontend
2. npm — ติดมากับ Node.js ใช้ติดตั้ง Dependencies
3. MariaDB — ฐานข้อมูลของระบบ
4. Visual Studio Code — ใช้เปิดและแก้โค้ด

เปิด PowerShell แล้วตรวจ Node.js และ npm:

```powershell
node --version
npm --version
```

ถ้าทั้งสองคำสั่งแสดงเลขเวอร์ชัน แปลว่าพร้อมใช้งาน ถ้าขึ้นว่าไม่รู้จักคำสั่ง ให้ติดตั้ง Node.js รุ่น LTS แล้วเปิด VS Code ใหม่

ทุกครั้งก่อนรันคำสั่ง ให้ตรวจพาธด้านซ้ายของ Prompt ให้ตรงกับหัวข้อนั้น คำสั่ง Backend ต้องอยู่ใน `learn project\BackEnd` และคำสั่ง Frontend ต้องอยู่ใน `learn project\FrontEnd` ห้ามรัน `npm install` จากโฟลเดอร์หลักหรือโฟลเดอร์ `เฉลย`

ตรวจว่า MariaDB เปิดอยู่ โดยเข้าโปรแกรมจัดการ Database ที่ใช้ เช่น HeidiSQL, phpMyAdmin หรือ MariaDB Client หากเชื่อม `localhost:3306` ได้ แปลว่าพร้อม

## เข้าใจโฟลเดอร์ก่อน

```text
LEARN PROJECT/
├─ BackEnd/       พื้นที่เขียน Backend
├─ FrontEnd/      พื้นที่เขียน Frontend
├─ เฉลย/          โค้ดตัวอย่าง เปิดเมื่อทำเองแล้วติด
├─ 00-SETUP...    ไฟล์ที่กำลังอ่าน
├─ 01-ภาพรวม...  ลำดับสร้างโปรเจกต์ตั้งแต่ต้นจนจบ
├─ 02-วิธี...     วิธีใช้เฉลย
├─ 03-สารบัญ...  ใช้ค้นหน้าที่ของไฟล์
└─ 04-เช็กลิสต์... ใช้ตรวจงาน
```

อย่ารันคำสั่งจากโฟลเดอร์ `เฉลย` ให้รันใน `BackEnd` หรือ `FrontEnd` ที่เป็นพื้นที่ฝึก

## จัดหน้าจอ VS Code ก่อนลงมือ

เพื่อไม่ให้คัดผิดไฟล์ ให้จัดดังนี้:

1. เปิดโฟลเดอร์ `learn project` เป็น Workspace หลัก ไม่เปิดเฉพาะ `เฉลย`
2. Explorer ฝั่งซ้ายจะเห็น `BackEnd`, `FrontEnd` และ `เฉลย`
3. เมื่อฝึกไฟล์หนึ่ง ให้เปิดไฟล์ฝึกด้านซ้ายของ Editor และไฟล์ชื่อเดียวกันใต้ `เฉลย` ด้านขวาด้วย Split Editor
4. Terminal ที่ 1 ใช้ Backend และต้องเห็นพาธลงท้าย `learn project\BackEnd`
5. Terminal ที่ 2 ใช้ Frontend และต้องเห็นพาธลงท้าย `learn project\FrontEnd`
6. อย่ารันสอง Server ใน Terminal เดียว เพราะจะมองไม่เห็น log ของอีกฝั่ง

สิ่งที่เกิดขึ้นระหว่างพัฒนา:

```text
Terminal Backend: npm run dev → เปิด API ที่ Port 5000
Terminal Frontend: npm run dev → เปิดหน้าเว็บที่ Port 5173
Browser: เปิด 5173 → Frontend เรียก 5000/api ผ่าน api.js
MariaDB: Backend ติดต่อผ่าน Prisma → ส่ง JSON กลับ Frontend
```

URL `http://localhost:5000/api` อาจตอบ 404 ได้เพราะ Server mount เป็นกลุ่ม `/api/auth`, `/api/users`, `/api/places`, `/api/reports` แต่ไม่ได้สร้าง GET `/api` จุดตรวจสุขภาพของโปรเจกต์คือ `http://localhost:5000/`

## ส่วน A — Setup Backend และ Dependencies

### 1. สร้าง `BackEnd/package.json`

ใส่เนื้อหานี้ลงใน `BackEnd/package.json` ได้เลย:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "db:create": "node scripts/createDatabase.js"
  },
  "dependencies": {
    "@prisma/adapter-mariadb": "^7.9.1",
    "@prisma/client": "^7.9.1",
    "bcrypt": "^6.0.0",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mariadb": "^3.4.5",
    "multer": "^2.2.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "prisma": "^7.9.1"
  }
}
```

หลังบันทึก ให้ตรวจว่า JSON อ่านได้ก่อนติดตั้ง:

```powershell
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"
```

ต้องเห็น `package.json OK` หากมี SyntaxError ให้แก้ comma, quote หรือวงเล็บในไฟล์ก่อน

### 2. ติดตั้ง Dependencies

เปิด Terminal ที่โฟลเดอร์ `BackEnd`:

```powershell
cd BackEnd
npm install
```

คำสั่งนี้จะสร้าง `node_modules` และ `package-lock.json` อัตโนมัติ ไม่ต้องคัดลอกสองอย่างนี้จากเฉลย

Backend จะติดตั้ง:

- `express`, `dotenv` — เปิด API และอ่าน `.env`
- `@prisma/client`, `@prisma/adapter-mariadb`, `prisma` — ติดต่อและจัดการ Database
- `bcrypt`, `jsonwebtoken` — Password และระบบ Login
- `multer` — อัปโหลดรูป
- `zod` — ตรวจข้อมูลที่ส่งเข้า API

หากสร้าง `package.json` เอง ใช้:

```powershell
npm install express dotenv @prisma/client @prisma/adapter-mariadb bcrypt jsonwebtoken mariadb multer zod
npm install --save-dev prisma
```

ตรวจว่าติดตั้งสำเร็จ:

```powershell
npm ls --depth=0
```

คำสั่งนี้มีหน้าที่แค่แสดงรายชื่อ Packages ที่ติดตั้งแล้วเท่านั้น:

- ถ้าเห็นรายชื่อ Packages และไม่มี `UNMET DEPENDENCY` หรือ `npm ERR!` ให้ถือว่าข้อนี้ผ่าน
- ไม่ต้องคัดข้อความผลลัพธ์ไปใส่ไฟล์ใด
- เมื่อตรวจเสร็จ ให้ไปทำ **ข้อ 4 สร้างไฟล์ `.env`** ต่อ

### 3. ดูลำดับที่จะทำต่อ — ตอนนี้ยังไม่ต้องรัน Prisma

> **หยุด:** ในข้อนี้ไม่มีคำสั่งที่ต้องรัน เป็นเพียงการบอกลำดับที่จะเจอภายหลัง

ตอนนี้ยังไม่ต้องรันคำสั่ง Prisma เพราะต้องเตรียม `.env` และ Database ใน **ส่วน B** ก่อน จากนั้น **ส่วน C** จะให้โค้ดเต็มของ `prisma.config.ts`, `prisma/schema.prisma` และ `src/lib/prisma.js` แล้วจึงสั่ง Prisma ตามลำดับ

ลำดับการทำงานจริงคือ:

```text
ตอนนี้: ตรวจ npm ls --depth=0 ให้ผ่าน
   ↓
ทำข้อ 4 เป็นต้นไปของคู่มือ 00 ให้ครบ
   ↓
เลือกเส้นทางการเรียน และไปเขียนไฟล์ Prisma
   ↓
ถ้าเลือกเส้นทางพิเศษ คู่มือ 05 จะบอกจุดที่ให้รันคำสั่งเอง
```

คำสั่งต่อไปนี้แสดงไว้ให้รู้จักล่วงหน้าเท่านั้น **ห้ามรันในขั้นตอนนี้**:

```powershell
npx prisma validate
npx prisma db push
npx prisma generate
npx prisma studio
```

- `npx prisma validate` ตรวจว่า Schema ถูกต้อง
- `npx prisma db push` สร้าง Database/ตาราง หรือปรับตารางให้ตรงกับ `schema.prisma`
- `npx prisma generate` สร้าง Prisma Client ให้ Backend import
- `npx prisma studio` เปิดหน้าจอสำหรับดูและแก้ข้อมูลในตาราง

สรุปสำหรับตอนนี้: **ไม่ต้องรันคำสั่ง Prisma ให้เลื่อนลงไปทำข้อ 4 สร้างไฟล์ `.env` ต่อทันที**

## ส่วน B — Environment และ Database

### 4. สร้างไฟล์ `.env`

ที่ Terminal ของ `BackEnd` รัน:

```powershell
Copy-Item .env.example .env
```

ถ้ามี `.env` อยู่แล้ว PowerShell จะไม่เขียนทับ ให้เปิดไฟล์เดิมและตรวจค่าตามรายการด้านล่าง ไม่ต้องลบค่ารหัสผ่านเพื่อทำ Setup ซ้ำ

จากนั้นเปิด `BackEnd/.env` แล้วกรอกค่าจริง ตัวอย่าง:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/trash_toilet_japan"
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=YOUR_PASSWORD
DATABASE_NAME=trash_toilet_japan

JWT_SECRET=เปลี่ยนเป็นข้อความสุ่มที่ยาวและเดายาก
```

จุดตรวจ Port ห้ามข้าม: ค่า `PORT` ใน `BackEnd/.env` ต้องเป็น `5000` ตามคู่มือนี้ หากไฟล์เดิมเป็น `3000` ให้แก้เป็น `5000`; ค่า `VITE_API_URL` ฝั่ง Frontend และ URL ที่ใช้ทดสอบต้องใช้เลขเดียวกันทั้งหมด

ความหมาย:

- `DATABASE_URL` ใช้โดยคำสั่ง Prisma CLI
- ตัวแปร `DATABASE_HOST` ถึง `DATABASE_NAME` ใช้โดย Backend ตอนเปิด Server
- `JWT_SECRET` ใช้เซ็น Token สำหรับ Login ห้ามส่งให้ผู้อื่น
- ห้ามนำ `.env` ขึ้น Git ให้แชร์เฉพาะ `.env.example`

ถ้า Password มีอักขระพิเศษ เช่น `@`, `:`, `/` หรือ `#` ต้องแปลงส่วนนั้นเป็น URL encoding ใน `DATABASE_URL` แต่ `DATABASE_PASSWORD` ใช้ Password จริงตามปกติ

#### 4.1 สร้างไฟล์ที่คำสั่ง `db:create` จะเรียกใช้

ก่อนรันคำสั่งสร้าง Database ให้เปิดไฟล์นี้:

```text
BackEnd/scripts/createDatabase.js
```

ลบเนื้อหาเดิมในไฟล์ แล้วใส่โค้ดต่อไปนี้ทั้งก้อน:

```js
import "dotenv/config";
import mariadb from "mariadb";

const database = process.env.DATABASE_NAME;

if (!database || !/^[A-Za-z0-9_]+$/.test(database)) {
  throw new Error("DATABASE_NAME ต้องมีเฉพาะตัวอักษร ตัวเลข หรือ underscore");
}

const connection = await mariadb.createConnection({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  allowPublicKeyRetrieval: true, // รองรับบัญชี MySQL 8 ที่ใช้ caching_sha2_password
});

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`Database ${database} is ready`);
} finally {
  await connection.end();
}
```

บันทึกไฟล์ แล้วตรวจ Syntax จาก Terminal ที่อยู่ใน `BackEnd`:

```powershell
node --check scripts/createDatabase.js
```

ถ้าไม่มีข้อความ Error ถือว่าไฟล์ถูกต้อง คำสั่ง `npm run db:create` ใน `package.json` จะเรียกไฟล์นี้ด้วย `node scripts/createDatabase.js`

#### 4.2 รันคำสั่งสร้าง Database

ตรวจว่า MariaDB เปิดอยู่และกรอก `.env` ครบแล้ว จากนั้นสร้าง Database ตาม `DATABASE_NAME` อัตโนมัติโดยไม่ต้องเข้าไปวาง SQL ใน MariaDB:

```powershell
npm run db:create
```

ต้องเห็น `Database trash_toilet_japan is ready` คำสั่งนี้รันซ้ำได้และไม่ลบข้อมูลเดิม จากนั้นจึงไปเขียน Schema ในเส้นทางที่เลือกและรัน Prisma ตามลำดับที่อธิบายไว้ด้านบน

หากพบ `ER_CANNOT_RETRIEVE_RSA_KEY` ให้ย้อนตรวจข้อ 4.1 ว่ามี `allowPublicKeyRetrieval: true` อยู่ภายใน `mariadb.createConnection({ ... })` บันทึกไฟล์ แล้วรัน `npm run db:create` ซ้ำ

> หากรอบแรก Error แต่รอบใหม่เห็น `Database trash_toilet_japan is ready` ถือว่าข้อนี้ผ่านแล้ว ไม่ต้องย้อนติดตั้ง Packages หรือสร้าง `.env` ใหม่ ให้ไปทำข้อ 5 ต่อทันที

## ส่วน C — Prisma

### 5. สร้างไฟล์ Prisma ด้วยโค้ดเต็ม

ขั้นนี้ทำในคู่มือ 00 เพียงครั้งเดียว ทั้งเส้นทางปกติและเส้นทางพิเศษจะใช้สองไฟล์นี้ต่อ ห้ามรอไปเขียนซ้ำในคู่มือถัดไป

#### 5.1 สร้าง `BackEnd/prisma.config.ts`

เปิด `BackEnd/prisma.config.ts` ลบ Comment แบบฝึกหัดเดิม แล้ววางโค้ดนี้ทั้งไฟล์:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config"; // defineConfig ช่วยตรวจรูปแบบ Config ของ Prisma

export default defineConfig({
  schema: "prisma/schema.prisma", // ระบุตำแหน่งไฟล์ Model/Enum ของ Database
  datasource: { // ส่ง Connection URL จาก Environment ให้ Prisma CLI
    url: process.env["DATABASE_URL"], // URL มี user, password, host, port และชื่อ Database
  },
});
```

ไฟล์นี้ทำให้ Prisma CLI อ่าน Schema จาก `prisma/schema.prisma` และเชื่อม Database ด้วย `DATABASE_URL` ใน `.env`

#### 5.2 สร้าง `BackEnd/prisma/schema.prisma`

เปิด `BackEnd/prisma/schema.prisma` ลบ Comment แบบฝึกหัดเดิม แล้ววางโค้ดนี้ทั้งไฟล์:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "mysql"
}

enum UserRole {
  member
  admin
}

enum PlaceType {
  toilet
  trash
}

enum PlaceStatus {
  pending
  active
  rejected
  inactive
}

enum ReportStatus {
  pending
  resolved
  rejected
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  avatarUrl String?
  role      UserRole @default(member)
  places    Place[]
  reports   Report[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Place {
  id          Int         @id @default(autoincrement())
  name        String
  type        PlaceType
  address     String
  imageUrl    String?
  latitude    Float
  longitude   Float
  status      PlaceStatus @default(pending)
  createdById Int
  createdBy   User        @relation(fields: [createdById], references: [id], onDelete: Cascade)
  reports     Report[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([status])
  @@index([type])
  @@index([latitude, longitude])
  @@index([createdById])
}

model Report {
  id               Int          @id @default(autoincrement())
  reason           String
  description      String?
  evidenceImageUrl String?
  status           ReportStatus @default(pending)
  placeId          Int
  reporterId       Int
  place            Place        @relation(fields: [placeId], references: [id], onDelete: Cascade)
  reporter         User         @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([status])
  @@index([placeId])
  @@index([reporterId])
}
```

ต้องวาง Model `User`, `Place` และ `Report` ให้ครบก่อนตรวจ เพราะแต่ละ Model อ้างถึงกัน หากตรวจตอนวางยังไม่ครบจะเกิด Error ชั่วคราว

#### 5.3 สร้าง `BackEnd/src/lib/prisma.js`

เปิด `BackEnd/src/lib/prisma.js` ลบ Comment แบบฝึกหัดเดิม แล้ววางโค้ดนี้ทั้งไฟล์:

```js
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  allowPublicKeyRetrieval: true, // รองรับบัญชี MySQL 8 ที่ใช้ caching_sha2_password
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
```

ไฟล์นี้ยังไม่ต้องรันตรง ๆ เพราะต้องรอ `npx prisma generate` สร้าง `generated/prisma/client.js` ก่อน หลังจากนั้น Controller ในคู่มือ 05 จึงจะ import `prisma` จากไฟล์นี้ได้

#### 5.4 สร้างตารางและ Prisma Client

บันทึกสองไฟล์ แล้วรันจาก Terminal `BackEnd` ตามลำดับ ห้ามข้ามคำสั่งที่ Error:

```powershell
npx prisma validate
npx prisma db push
npx prisma generate
npx prisma studio
```

ผลที่ต้องได้:

- `validate` แจ้งว่า Schema ถูกต้อง
- `db push` แจ้งว่า Database ตรงกับ Schema
- `generate` สร้าง `BackEnd/generated/prisma`
- `studio` เปิดและมองเห็นตาราง `User`, `Place`, `Report`; ตรวจเสร็จแล้วกด `Ctrl+C`

### 6. จุดตรวจ Setup Backend

ก่อนข้ามไป Frontend ต้องครบทุกข้อ:

1. Terminal อยู่ที่ `learn project\BackEnd`
2. `package.json` เป็น JSON ที่ตรวจผ่าน
3. `npm install` สำเร็จ และมี `node_modules` กับ `package-lock.json`
4. `npm ls --depth=0` ไม่มี `UNMET DEPENDENCY`
5. MariaDB เปิดอยู่ และ `.env` ตั้งชื่อ Database ใน `DATABASE_URL`/`DATABASE_NAME` ตรงกัน
6. `.env` มีค่าครบ แต่ยังไม่แชร์รหัสผ่าน
7. `node --check scripts/createDatabase.js` ผ่าน
8. `scripts/createDatabase.js` มี `allowPublicKeyRetrieval: true`
9. `npm run db:create` ผ่านและแจ้งว่า Database พร้อม
10. `prisma.config.ts`, `prisma/schema.prisma` และ `src/lib/prisma.js` มีโค้ดเต็มจากข้อ 5
11. `src/lib/prisma.js` มี `allowPublicKeyRetrieval: true`
12. `npx prisma validate`, `db push` และ `generate` ผ่าน
13. Prisma Studio มองเห็นตาราง `User`, `Place` และ `Report`

### 7. ยังไม่ต้องเปิด Backend

`npm run dev` ต้องใช้ `BackEnd/src/server.js` ซึ่งจะเริ่มสร้างหลัง Setup ดังนั้นแม้ Database, ตาราง และ Prisma Client พร้อมแล้ว ก็ยังไม่ต้องเปิด Backend ในข้อ 00 ให้ไปสร้าง Server ตามเส้นทางที่เลือกก่อน

## ส่วน D — Setup Frontend

เปิด Terminal ใหม่ที่โฟลเดอร์หลัก แล้วเข้า `FrontEnd`

### 1. สร้าง `FrontEnd/package.json`

ใส่เนื้อหานี้ลงใน `FrontEnd/package.json` ได้เลย:

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.19.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.31.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-geolocated": "^4.5.1",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^7.18.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "tailwindcss": "^4.3.3",
    "vite": "^8.2.0"
  }
}
```

หลังบันทึก ให้ตรวจว่า JSON อ่านได้ก่อนติดตั้ง:

```powershell
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"
```

### 2. ติดตั้ง Dependencies

```powershell
cd FrontEnd
npm install
```

Frontend จะติดตั้ง:

- `react`, `react-dom`, `react-router-dom` — หน้าจอและการเปลี่ยนหน้า
- `axios` — เรียก Backend
- `leaflet`, `react-leaflet` — แผนที่
- `react-geolocated` — GPS
- `lucide-react` — Icon
- `vite`, `@vitejs/plugin-react` — Dev Server และ Build
- `tailwindcss`, `@tailwindcss/vite` — CSS
- `oxlint` — ตรวจโค้ด
- `@types/react`, `@types/react-dom` — Type information ที่เครื่องมือพัฒนาใช้

หากสร้าง `package.json` เอง ใช้:

```powershell
npm install react react-dom react-router-dom axios leaflet react-leaflet react-geolocated lucide-react
npm install --save-dev vite @vitejs/plugin-react tailwindcss @tailwindcss/vite oxlint @types/react @types/react-dom
```

ตรวจด้วย:

```powershell
npm ls --depth=0
```

### 3. สร้างไฟล์ตั้งค่า Frontend

สร้าง `FrontEnd/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

สร้าง `FrontEnd/.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

จากนั้นสร้าง Environment ของ Frontend:

```powershell
Copy-Item .env.example .env.local
```

ตรวจว่า `FrontEnd/.env.local` มี:

```env
VITE_API_URL=http://localhost:5000/api
```

ถ้าแก้ `.env.local` ขณะ Frontend เปิดอยู่ ให้หยุดด้วย `Ctrl+C` แล้วรันใหม่ เพราะ Vite อ่าน Environment ตอนเริ่มทำงาน

### 4. ยังไม่ต้องเปิด Frontend

Frontend ยังขาด `App.jsx`, `main.jsx` และหน้าต่าง ๆ ที่จะทำในภาค Frontend ของคู่มือ `05` ดังนั้นใน `00` ให้ติดตั้ง Dependencies และเตรียม Config/Environment เท่านั้น

## ทดสอบว่า Setup สำเร็จ

ตรวจตามลำดับ:

- [ ] `node --version` และ `npm --version` แสดงเลขเวอร์ชัน
- [ ] MariaDB เปิดและเชื่อมต่อได้
- [ ] ตั้ง `DATABASE_URL` ให้ใช้ชื่อ Database `trash_toilet_japan` แล้ว
- [ ] Backend `npm install` สำเร็จ
- [ ] `BackEnd/.env` มีค่า Database และ `JWT_SECRET`
- [ ] `BackEnd/prisma.config.ts` พร้อม
- [ ] Frontend `npm install` สำเร็จ
- [ ] `FrontEnd/vite.config.js`, `.oxlintrc.json` และ `.env.local` พร้อม
- [ ] มี `FrontEnd/public/favicon.svg`, `trash-toilet-logo.png` และ `auth-background.png` ซึ่งหน้าเว็บเรียกใช้

เมื่อติ๊กครบ ให้เลือกเส้นทางเดียว: เส้นทางปกติเริ่มที่ `01-ภาพรวมระบบ.md` หรือเส้นทางพิเศษเริ่มที่ `05-คู่มือลงมือทั้งระบบ-ทีละก้อน.md`

> จุดตรวจ Server/API อยู่ใน `01`: ระบบ 2 ขั้น B1 ยิง `GET /` ตรวจ Server และขั้น B5–B6 ตรวจ Register/Login กับ Database

หลัง Setup ยังไม่ควรคาดหวังให้หน้าเว็บสมบูรณ์ เพราะไฟล์ฝึกยังเป็นโครง TODO จุดประสงค์ของ `00` คือให้เครื่องมือและ Environment พร้อมเท่านั้น จากนั้น `01` จะพาสร้างโค้ดทำงานทีละก้อน

## ความสัมพันธ์ของ Port ที่ต้องตรงกัน

- `BackEnd/.env` ค่า `PORT=5000` ทำให้ Express ฟัง Port 5000
- `FrontEnd/.env.local` ค่า `VITE_API_URL=http://localhost:5000/api` ต้องชี้ Port เดียวกัน
- `BackEnd/.env` ค่า `FRONTEND_URL=http://localhost:5173` อนุญาต CORS จาก Vite
- หากเปลี่ยน Port ใด ต้องเปลี่ยนค่าที่อ้างถึง Port นั้นและ restart Server

## Error ที่มือใหม่พบบ่อย

### `npm` หรือ `node` ไม่รู้จัก

ติดตั้ง Node.js รุ่น LTS แล้วปิด–เปิด VS Code ใหม่

### `Cannot find package` หรือ `Cannot find module`

ตรวจว่า Terminal อยู่ใน `BackEnd` หรือ `FrontEnd` ที่ถูกต้อง แล้วรัน `npm install`

### Prisma เชื่อม Database ไม่ได้

ตรวจว่า MariaDB เปิดอยู่ และค่าทั้ง `DATABASE_URL` กับ `DATABASE_HOST/USER/PASSWORD/NAME` ใน `.env` ตรงกัน

### Port ถูกใช้งานอยู่

ตรวจว่าไม่ได้เปิด Dev Server ซ้ำหลาย Terminal หรือเปลี่ยน `PORT` โดยต้องแก้ `VITE_API_URL` ให้ตรงกันด้วย

### Frontend เรียก Backend ไม่ได้

ตรวจว่า Backend ยังเปิดอยู่, `VITE_API_URL` ใช้ Port 5000 และ `FRONTEND_URL` เป็น `http://localhost:5173`

### แก้ `.env` แล้วค่าไม่เปลี่ยน

หยุด Server ด้วย `Ctrl+C` แล้วรัน `npm run dev` ใหม่
