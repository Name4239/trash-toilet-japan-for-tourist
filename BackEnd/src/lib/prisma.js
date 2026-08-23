import "dotenv/config";
// ลำดับอ่าน 5: Controllers import prisma จากไฟล์นี้เพื่อคุยกับ MariaDB | ไฟล์นี้อ่านค่าการเชื่อมต่อจาก .env แล้วสร้าง Prisma Client หนึ่งตัว | ดูว่ามีตารางและ field อะไรได้ต่อที่ prisma/schema.prisma
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { PrismaClient } from "../../generated/prisma/client.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

const adapter = new PrismaMariaDb({
// Adapter ใช้ข้อมูลจาก .env เพื่อเชื่อม Node.js ไปยัง MariaDB
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  allowPublicKeyRetrieval: true,
  // MySQL 8 may use caching_sha2_password, which requires the client to | retrieve the server's RSA public key when the connection is not using TLS.
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });
// prisma คือตัวกลางที่ Controllers ใช้อ่านและแก้ข้อมูลใน Database

export { prisma };
