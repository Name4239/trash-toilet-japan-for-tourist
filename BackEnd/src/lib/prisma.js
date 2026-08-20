// ลำดับอ่าน 5: Controllers import prisma จากไฟล์นี้เพื่อคุยกับ MariaDB
// ไฟล์นี้อ่านค่าการเชื่อมต่อจาก .env แล้วสร้าง Prisma Client หนึ่งตัว
// ดูว่ามีตารางและ field อะไรได้ต่อที่ prisma/schema.prisma
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

// Adapter ใช้ข้อมูลจาก .env เพื่อเชื่อม Node.js ไปยัง MariaDB
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

// prisma คือตัวกลางที่ Controllers ใช้อ่านและแก้ข้อมูลใน Database
const prisma = new PrismaClient({ adapter });

export { prisma };
