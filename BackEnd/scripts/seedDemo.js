import "dotenv/config"; // สร้างข้อมูลตัวอย่างขนาดเล็กสำหรับทดลองหน้า Member และ Admin
import bcrypt from "bcrypt"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { prisma } from "../src/lib/prisma.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

const password = await bcrypt.hash("123456", 10); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป

try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
  const member = await prisma.user.upsert({ // upsert ทำให้รันซ้ำได้โดยไม่สร้าง Email ซ้ำ
    where: { email: "demo.member@example.com" },
    update: { name: "Demo Member", password, role: "member" },
    create: { name: "Demo Member", email: "demo.member@example.com", password, role: "member" },
  });

  const admin = await prisma.user.upsert({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
    where: { email: "demo.admin@example.com" },
    update: { name: "Demo Admin", password, role: "admin" },
    create: { name: "Demo Admin", email: "demo.admin@example.com", password, role: "admin" },
  });

  async function findOrCreatePlace(data) { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    const existingPlace = await prisma.place.findFirst({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: { name: data.name, createdById: data.createdById },
    });

    if (existingPlace) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return prisma.place.update({ where: { id: existingPlace.id }, data }); // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    }

    return prisma.place.create({ data }); // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
  }

  const toilet = await findOrCreatePlace({ // สองรายการ active ใช้ทดลอง Marker ห้องน้ำและถังขยะ
    name: "Ueno Park Public Toilet",
    type: "toilet",
    address: "Ueno Park, Taito City, Tokyo",
    latitude: 35.7148,
    longitude: 139.7732,
    status: "active",
    createdById: admin.id,
  });

  await findOrCreatePlace({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
    name: "Shibuya Station Trash Point",
    type: "trash",
    address: "Shibuya Station, Tokyo",
    latitude: 35.658,
    longitude: 139.7016,
    status: "active",
    createdById: admin.id,
  });

  await findOrCreatePlace({ // รายการนี้ใช้ทดลองหน้า Admin Pending Places
    name: "Asakusa Visitor Toilet Request",
    type: "toilet",
    address: "Asakusa, Taito City, Tokyo",
    latitude: 35.7147,
    longitude: 139.7967,
    status: "pending",
    createdById: member.id,
  });

  const existingReport = await prisma.report.findFirst({ // สร้าง Report pending เพียงรายการเดียว ถ้ายังไม่มี
    where: { placeId: toilet.id, reporterId: member.id, reason: "wrong_info" },
  });

  if (!existingReport) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    await prisma.report.create({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      data: {
        placeId: toilet.id,
        reporterId: member.id,
        reason: "wrong_info",
        description: "เวลาเปิดให้บริการอาจไม่ตรงกับข้อมูล กรุณาตรวจสอบ",
        status: "pending",
      },
    });
  } else {
    await prisma.report.update({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: { id: existingReport.id },
      data: { status: "pending" },
    });
  }

  console.log("Demo data created successfully");
  console.log("Member: demo.member@example.com / 123456");
  console.log("Admin: demo.admin@example.com / 123456");
} finally {
  await prisma.$disconnect(); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
}
