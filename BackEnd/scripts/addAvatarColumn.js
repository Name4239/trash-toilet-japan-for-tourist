// ช่วยปรับ Database เดิมหลัง schema.prisma เพิ่ม avatarUrl แต่ migration history ไม่ตรงกัน
// ใช้ครั้งเดียว แล้วอ่านระบบจริงต่อที่ userController.updateAvatar
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

try {
  const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM User LIKE 'avatarUrl'");

  if (columns.length === 0) {
    await prisma.$executeRawUnsafe("ALTER TABLE User ADD COLUMN avatarUrl VARCHAR(191) NULL");
    console.log("Added User.avatarUrl");
  } else {
    console.log("User.avatarUrl already exists");
  }
} finally {
  await prisma.$disconnect();
}
