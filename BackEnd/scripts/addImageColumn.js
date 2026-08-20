// ใช้ครั้งเดียวสำหรับ Database เดิมที่ไม่มี migration history
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

try {
  const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM Place LIKE 'imageUrl'");

  if (columns.length === 0) {
    await prisma.$executeRawUnsafe("ALTER TABLE Place ADD COLUMN imageUrl VARCHAR(191) NULL");
    console.log("Added Place.imageUrl");
  } else {
    console.log("Place.imageUrl already exists");
  }
} finally {
  await prisma.$disconnect();
}
