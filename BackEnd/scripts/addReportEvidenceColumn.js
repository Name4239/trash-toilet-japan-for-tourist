// ช่วยปรับ Database เดิมหลัง Report เพิ่ม evidenceImageUrl แต่ migration history ไม่ตรงกัน
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

try {
  const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM Report LIKE 'evidenceImageUrl'");
  if (columns.length === 0) {
    await prisma.$executeRawUnsafe("ALTER TABLE Report ADD COLUMN evidenceImageUrl VARCHAR(191) NULL");
    console.log("Added Report.evidenceImageUrl");
  } else {
    console.log("Report.evidenceImageUrl already exists");
  }
} finally {
  await prisma.$disconnect();
}
