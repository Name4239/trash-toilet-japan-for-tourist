import jwt from "jsonwebtoken";
// ลำดับอ่าน 3A: Route เรียกไฟล์นี้ก่อน Controller เมื่อ API ต้อง Login | ถ้า Token ผ่าน ไฟล์นี้สร้าง req.user แล้วส่งต่อด้วย next() | หลัง next() ให้กลับไปดู Route ว่าฟังก์ชันถัดไปคือ Admin Middleware หรือ Controller

export function authMiddleware(req, res, next) {
// Middleware นี้ทำงานหลัง Route ได้รับ request และก่อนเข้า Controller
  const authorization = req.headers.authorization;
  // Frontend/Postman ต้องส่ง Header รูปแบบ: Authorization: Bearer TOKEN

  if (!authorization || !authorization.startsWith("Bearer ")) {
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }

  const token = authorization.split(" ")[1];
  // แยกเอาเฉพาะ Token ที่อยู่หลังคำว่า Bearer

  try {
  // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // ตรวจ Token แล้วเก็บ userId และ role ไว้ให้ Controller ใช้ต่อ
    next();
  } catch {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}

export function optionalAuthMiddleware(req, res, next) {
// Middleware แบบ optional ใช้กับ Route ที่เปิดให้คนทั่วไป แต่ Admin มีสิทธิ์เพิ่ม
  const authorization = req.headers.authorization;
  // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

  if (!authorization) {
  // ถ้าไม่ได้ส่ง Token มาก็ให้คนทั่วไปใช้งาน Route ต่อได้
    return next();
    // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
  }

  if (!authorization.startsWith("Bearer ")) {
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    return res.status(401).json({ message: "รูปแบบ Token ไม่ถูกต้อง" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }

  try {
  // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const token = authorization.split(" ")[1];
    // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
    // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
  } catch {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}
