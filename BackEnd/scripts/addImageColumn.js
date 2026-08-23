import "dotenv/config";
// ใช้ครั้งเดียวสำหรับ Database เดิมที่ไม่มี migration history
import { prisma } from "../src/lib/prisma.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

try {
// เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
  const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM Place LIKE 'imageUrl'");
  // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป

  if (columns.length === 0) {
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    await prisma.$executeRawUnsafe("ALTER TABLE Place ADD COLUMN imageUrl VARCHAR(191) NULL");
    // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
    console.log("Added Place.imageUrl");
  } else {
    console.log("Place.imageUrl already exists");
  }
} finally {
  await prisma.$disconnect();
  // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
}
