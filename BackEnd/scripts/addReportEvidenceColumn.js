import "dotenv/config";
// ช่วยปรับ Database เดิมหลัง Report เพิ่ม evidenceImageUrl แต่ migration history ไม่ตรงกัน
import { prisma } from "../src/lib/prisma.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

try {
// เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
  const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM Report LIKE 'evidenceImageUrl'");
  // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
  if (columns.length === 0) {
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    await prisma.$executeRawUnsafe("ALTER TABLE Report ADD COLUMN evidenceImageUrl VARCHAR(191) NULL");
    // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
    console.log("Added Report.evidenceImageUrl");
  } else {
    console.log("Report.evidenceImageUrl already exists");
  }
} finally {
  await prisma.$disconnect();
  // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
}
