// ลำดับอ่าน 3A: Route เรียกไฟล์นี้ก่อน Controller เมื่อ API ต้อง Login
// ถ้า Token ผ่าน ไฟล์นี้สร้าง req.user แล้วส่งต่อด้วย next()
// หลัง next() ให้กลับไปดู Route ว่าฟังก์ชันถัดไปคือ Admin Middleware หรือ Controller
import jwt from "jsonwebtoken";

// Middleware นี้ทำงานหลัง Route ได้รับ request และก่อนเข้า Controller
export function authMiddleware(req, res, next) {
  // Frontend/Postman ต้องส่ง Header รูปแบบ: Authorization: Bearer TOKEN
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
  }

  // แยกเอาเฉพาะ Token ที่อยู่หลังคำว่า Bearer
  const token = authorization.split(" ")[1];

  try {
    // ตรวจ Token แล้วเก็บ userId และ role ไว้ให้ Controller ใช้ต่อ
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

// Middleware แบบ optional ใช้กับ Route ที่เปิดให้คนทั่วไป แต่ Admin มีสิทธิ์เพิ่ม
export function optionalAuthMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  // ถ้าไม่ได้ส่ง Token มาก็ให้คนทั่วไปใช้งาน Route ต่อได้
  if (!authorization) {
    return next();
  }

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "รูปแบบ Token ไม่ถูกต้อง" });
  }

  try {
    const token = authorization.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}
