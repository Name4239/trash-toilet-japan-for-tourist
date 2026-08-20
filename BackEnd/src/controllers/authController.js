// ลำดับอ่าน 4A: authRoutes ส่ง Register/Login มาที่ไฟล์นี้
// Controller ตรวจข้อมูล → เรียก Prisma → ส่ง JSON กลับ Postman/Frontend
// อ่านการคุยกับ Database ต่อได้ที่ lib/prisma.js และ prisma/schema.prisma
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

function createToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register เริ่มทำงานหลัง authRoutes รับ request
export async function register(req, res) {
  try {
    // รับข้อมูล JSON ที่ Express แปลงไว้ใน req.body
    const { name, email, password } = req.body;

    // หยุดทันทีถ้าข้อมูลสมัครสมาชิกไม่ครบ
    if (!name || !email || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    // ค้นหา email เพราะ schema กำหนดให้ email ห้ามซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // เปลี่ยนรหัสผ่านเป็น hash ก่อนบันทึก ห้ามเก็บรหัสผ่านจริง
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prisma สร้างแถวใหม่ในตาราง User และ role เริ่มต้นเป็น member
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // ส่งข้อมูลที่ปลอดภัยกลับ จึงไม่ส่ง password กลับไป
    return res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// POST /api/auth/login ตรวจ email/password แล้วสร้าง JWT
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    // ค้นหาผู้ใช้จาก email ที่เป็น unique
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // เปรียบเทียบรหัสที่ส่งมากับ hash ใน Database
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // Token เก็บเฉพาะข้อมูลที่ Middleware ต้องใช้ ไม่เก็บ password
    const token = createToken(user);

    // Frontend จะเก็บ Token นี้ไว้ส่งกับ API ที่ต้อง Login
    return res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}
