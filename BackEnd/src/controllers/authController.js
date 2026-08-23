import bcrypt from "bcrypt";
// ลำดับอ่าน 4A: authRoutes ส่ง Register/Login มาที่ไฟล์นี้ | Controller ตรวจข้อมูล → เรียก Prisma → ส่ง JSON กลับ Postman/Frontend | อ่านการคุยกับ Database ต่อได้ที่ lib/prisma.js และ prisma/schema.prisma
import { prisma } from "../lib/prisma.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import jwt from "jsonwebtoken";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

function createToken(user) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return jwt.sign(
  // jwt.sign() สร้าง Token ที่ Backend สามารถตรวจสอบภายหลังได้
    { userId: user.id, role: user.role },
    // Payload: เก็บ id สำหรับระบุผู้ใช้ และ role สำหรับตรวจสิทธิ์ Member/Admin | ไม่ใส่ password หรือข้อมูลลับลงใน Token
    process.env.JWT_SECRET,
    // Secret ใช้เซ็นและตรวจลายเซ็น Token ต้องตรงกับค่า JWT_SECRET ใน .env
    { expiresIn: "7d" }
    // Token หมดอายุใน 7 วัน หลังจากนั้นผู้ใช้ต้อง Login ใหม่
  );
}

export async function register(req, res) {
// POST /api/auth/register เริ่มทำงานหลัง authRoutes รับ request
  try {
  // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const { name, email, password } = req.body;
    // รับข้อมูล JSON ที่ Express แปลงไว้ใน req.body

    if (!name || !email || !password) {
    // หยุดทันทีถ้าข้อมูลสมัครสมาชิกไม่ครบ
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const existingUser = await prisma.user.findUnique({
    // ค้นหา email เพราะ schema กำหนดให้ email ห้ามซ้ำ
      where: { email },
    });

    if (existingUser) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // เปลี่ยนรหัสผ่านเป็น hash ก่อนบันทึก ห้ามเก็บรหัสผ่านจริง

    const user = await prisma.user.create({
    // Prisma สร้างแถวใหม่ในตาราง User และ role เริ่มต้นเป็น member
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
    // ส่งข้อมูลที่ปลอดภัยกลับ จึงไม่ส่ง password กลับไป
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
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}

export async function login(req, res) {
// POST /api/auth/login ตรวจ email/password แล้วสร้าง JWT
  try {
  // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const { email, password } = req.body;
    // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

    if (!email || !password) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const user = await prisma.user.findUnique({
    // ค้นหาผู้ใช้จาก email ที่เป็น unique
      where: { email },
    });

    if (!user) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    // เปรียบเทียบรหัสที่ส่งมากับ hash ใน Database

    if (!passwordIsCorrect) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const token = createToken(user);
    // Token เก็บเฉพาะข้อมูลที่ Middleware ต้องใช้ ไม่เก็บ password

    return res.json({
    // Frontend จะเก็บ Token นี้ไว้ส่งกับ API ที่ต้อง Login
      message: "เข้าสู่ระบบสำเร็จ",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}
