// ลำดับอ่าน 4B: userRoutes → authMiddleware → uploadAvatar (ถ้าเปลี่ยนรูป) → ไฟล์นี้
// req.user มาจาก JWT ที่ authMiddleware แกะไว้ให้แล้ว
// จากนี้ Controller ใช้ prisma ไปอ่านตาราง User
import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

export async function getMe(req, res) {
  try {
    // userId มาจาก Token ที่ authMiddleware ตรวจเรียบร้อยแล้ว
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      // เลือกเฉพาะข้อมูลที่ปลอดภัย จึงไม่มี password ส่งกลับไป
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// PATCH /api/users/me/avatar เปลี่ยนรูปโปรไฟล์ของผู้ใช้ที่ Login อยู่
export async function updateAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกรูปโปรไฟล์" });
    }

    const oldUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { avatarUrl: true },
    });

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: `/uploads/${req.file.filename}` },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });

    // เมื่อบันทึกรูปใหม่สำเร็จ จึงลบรูปเก่าเพื่อไม่ให้ไฟล์ค้าง
    if (oldUser?.avatarUrl) {
      const oldImagePath = path.resolve(oldUser.avatarUrl.replace(/^\//, ""));
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    return res.json({ message: "เปลี่ยนรูปโปรไฟล์สำเร็จ", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}
