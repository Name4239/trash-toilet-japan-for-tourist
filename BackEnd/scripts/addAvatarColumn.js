import "dotenv/config";
// ช่วยปรับ Database เดิมหลัง schema.prisma เพิ่ม avatarUrl แต่ migration history ไม่ตรงกัน | ใช้ครั้งเดียว แล้วอ่านระบบจริงต่อที่ userController.updateAvatar
import { prisma } from "../src/lib/prisma.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

try {
// เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
  const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM User LIKE 'avatarUrl'");
  // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป

  if (columns.length === 0) {
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    await prisma.$executeRawUnsafe("ALTER TABLE User ADD COLUMN avatarUrl VARCHAR(191) NULL");
    // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
    console.log("Added User.avatarUrl");
  } else {
    console.log("User.avatarUrl already exists");
  }
} finally {
  await prisma.$disconnect();
  // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
}
