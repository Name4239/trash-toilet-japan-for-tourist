// สร้างข้อมูลตัวอย่างขนาดเล็กสำหรับทดลองหน้า Member และ Admin
import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

const password = await bcrypt.hash("123456", 10);

try {
  // upsert ทำให้รันซ้ำได้โดยไม่สร้าง Email ซ้ำ
  const member = await prisma.user.upsert({
    where: { email: "demo.member@example.com" },
    update: { name: "Demo Member", password, role: "member" },
    create: { name: "Demo Member", email: "demo.member@example.com", password, role: "member" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "demo.admin@example.com" },
    update: { name: "Demo Admin", password, role: "admin" },
    create: { name: "Demo Admin", email: "demo.admin@example.com", password, role: "admin" },
  });

  async function findOrCreatePlace(data) {
    const existingPlace = await prisma.place.findFirst({
      where: { name: data.name, createdById: data.createdById },
    });

    if (existingPlace) {
      return prisma.place.update({ where: { id: existingPlace.id }, data });
    }

    return prisma.place.create({ data });
  }

  // สองรายการ active ใช้ทดลอง Marker ห้องน้ำและถังขยะ
  const toilet = await findOrCreatePlace({
    name: "Ueno Park Public Toilet",
    type: "toilet",
    address: "Ueno Park, Taito City, Tokyo",
    latitude: 35.7148,
    longitude: 139.7732,
    status: "active",
    createdById: admin.id,
  });

  await findOrCreatePlace({
    name: "Shibuya Station Trash Point",
    type: "trash",
    address: "Shibuya Station, Tokyo",
    latitude: 35.658,
    longitude: 139.7016,
    status: "active",
    createdById: admin.id,
  });

  // รายการนี้ใช้ทดลองหน้า Admin Pending Places
  await findOrCreatePlace({
    name: "Asakusa Visitor Toilet Request",
    type: "toilet",
    address: "Asakusa, Taito City, Tokyo",
    latitude: 35.7147,
    longitude: 139.7967,
    status: "pending",
    createdById: member.id,
  });

  // สร้าง Report pending เพียงรายการเดียว ถ้ายังไม่มี
  const existingReport = await prisma.report.findFirst({
    where: { placeId: toilet.id, reporterId: member.id, reason: "wrong_info" },
  });

  if (!existingReport) {
    await prisma.report.create({
      data: {
        placeId: toilet.id,
        reporterId: member.id,
        reason: "wrong_info",
        description: "เวลาเปิดให้บริการอาจไม่ตรงกับข้อมูล กรุณาตรวจสอบ",
        status: "pending",
      },
    });
  } else {
    await prisma.report.update({
      where: { id: existingReport.id },
      data: { status: "pending" },
    });
  }

  console.log("Demo data created successfully");
  console.log("Member: demo.member@example.com / 123456");
  console.log("Admin: demo.admin@example.com / 123456");
} finally {
  await prisma.$disconnect();
}
