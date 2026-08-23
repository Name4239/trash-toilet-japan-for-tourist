import { prisma } from "../lib/prisma.js";
// ลำดับอ่าน 4B: userRoutes → authMiddleware → uploadAvatar (ถ้าเปลี่ยนรูป) → ไฟล์นี้ | req.user มาจาก JWT ที่ authMiddleware แกะไว้ให้แล้ว | จากนี้ Controller ใช้ prisma ไปอ่านตาราง User
import fs from "fs";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import path from "path";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export async function getMe(req, res) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  try {
  // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const user = await prisma.user.findUnique({
    // userId มาจาก Token ที่ authMiddleware ตรวจเรียบร้อยแล้ว
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      // เลือกเฉพาะข้อมูลที่ปลอดภัย จึงไม่มี password ส่งกลับไป
    });

    if (!user) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    return res.json({ user });
    // ส่งข้อมูล JSON กลับ Postman หรือ Frontend
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}

export async function updateAvatar(req, res) {
// PATCH /api/users/me/avatar เปลี่ยนรูปโปรไฟล์ของผู้ใช้ที่ Login อยู่
  try {
  // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    if (!req.file) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "กรุณาเลือกรูปโปรไฟล์" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const oldUser = await prisma.user.findUnique({
    // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: { id: req.user.userId },
      select: { avatarUrl: true },
    });

    const user = await prisma.user.update({
    // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: { id: req.user.userId },
      data: { avatarUrl: `/uploads/${req.file.filename}` },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });

    if (oldUser?.avatarUrl) {
    // เมื่อบันทึกรูปใหม่สำเร็จ จึงลบรูปเก่าเพื่อไม่ให้ไฟล์ค้าง
      const oldImagePath = path.resolve(oldUser.avatarUrl.replace(/^\//, ""));
      // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    }

    return res.json({ message: "เปลี่ยนรูปโปรไฟล์สำเร็จ", user });
    // ส่งข้อมูล JSON กลับ Postman หรือ Frontend
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}
