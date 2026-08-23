import { z } from "zod";
// ลำดับอ่าน 3D: ไฟล์รวมกติกาข้อมูลที่ Routes ส่งให้ validateMiddleware | Schema บอกว่า field ใดจำเป็น เป็นชนิดใด และอนุญาตค่าอะไรบ้าง

export const registerSchema = z.object({
// Register รับข้อมูลจาก POST /api/auth/register
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100, "ชื่อยาวเกินไป"),
  // trim() ตัดช่องว่างหัวท้าย และห้ามชื่อว่างหรือยาวเกิน 100 ตัวอักษร
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").toLowerCase(),
  // ตรวจรูปแบบ email และเปลี่ยนเป็นตัวพิมพ์เล็กก่อนส่งให้ Controller
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  // รหัสผ่านต้องเป็นข้อความและยาวอย่างน้อย 6 ตัวอักษร
});

export const loginSchema = z.object({
// Login รับข้อมูลจาก POST /api/auth/login
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").toLowerCase(),
  // จัดรูป email ให้เหมือนตอน Register เพื่อค้นหาใน Database ได้ตรงกัน
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
  // Login ตรวจเพียงว่ามี password ส่วน bcrypt จะตรวจว่าถูกต้องใน Controller
});

export const placeIdSchema = z.object({
// ตรวจ :id ใน URL ของ Place เช่น /api/places/1
  id: z.coerce.number().int().positive("Place id ต้องมากกว่า 0"),
  // Params เริ่มเป็น string จึงใช้ coerce แปลงเป็นเลขจำนวนเต็มบวก
});

export const createPlaceSchema = z.object({
// ตรวจ Body ตอน Member/Admin เพิ่มสถานที่
  name: z.string().trim().min(1, "กรุณากรอกชื่อสถานที่").max(150),
  // ชื่อและที่อยู่ต้องไม่ว่าง พร้อมจำกัดความยาวไม่ให้ข้อมูลใหญ่เกินไป
  type: z.enum(["toilet", "trash"], {
  // enum อนุญาตเฉพาะประเภทที่ schema.prisma กำหนดไว้
    message: "type ต้องเป็น toilet หรือ trash",
  }),
  address: z.string().trim().min(1, "กรุณากรอกที่อยู่").max(255),
  latitude: z.coerce.number().min(-90).max(90),
  // latitude อยู่ระหว่าง -90 ถึง 90 และ longitude อยู่ระหว่าง -180 ถึง 180
  longitude: z.coerce.number().min(-180).max(180),
});

export const placesQuerySchema = z.object({
// ตรวจ Query ของ GET /api/places เช่น ?type=toilet&status=active
  type: z.enum(["toilet", "trash"]).optional(),
  // optional() หมายถึงไม่ส่ง field นี้มาก็ได้
  search: z.string().trim().max(150).optional(),
  status: z
  // all ใช้สำหรับ Admin ขอดู Place ทุกสถานะ โดย Controller จะตรวจ role อีกครั้ง
    .enum(["pending", "active", "rejected", "inactive", "all"])
    .optional(),
});

export const nearbyQuerySchema = z.object({
// ตรวจ GPS Query ของ GET /api/places/nearby
  latitude: z.coerce.number().min(-90).max(90),
  // Query เป็น string จึงใช้ coerce แปลงเป็น number ก่อนตรวจช่วงพิกัด
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(100).optional(),
  // radius เป็นกิโลเมตร ต้องมากกว่า 0 และจำกัดสูงสุดไว้ที่ 100 กิโลเมตร
});

export const placeStatusSchema = z.object({
// ตรวจ Body ตอน Admin เปลี่ยนสถานะ Place
  status: z.enum(["pending", "active", "rejected", "inactive"]),
  // รับเฉพาะค่าที่มีอยู่ใน PlaceStatus ของ schema.prisma
});

export const createReportSchema = z.object({
// ตรวจ Body ตอน Member/Admin ส่ง Report
  placeId: z.coerce.number().int().positive(),
  // placeId ต้องเป็น ID ของ Place และ Controller จะตรวจต่อว่า Place มีจริงหรือไม่
  reason: z.string().trim().min(1, "กรุณากรอกเหตุผล").max(100),
  // reason จำเป็น ส่วน description ไม่จำเป็น
  description: z.string().trim().max(1000).optional(),
});

export const reportsQuerySchema = z.object({
// ตรวจ Query สำหรับ Admin กรองรายการ Report ตาม status
  status: z.enum(["pending", "resolved", "rejected"]).optional(),
});

export const reportIdSchema = z.object({
// ตรวจ :id ใน URL ของ Report เช่น /api/reports/1
  id: z.coerce.number().int().positive("Report id ต้องมากกว่า 0"),
});

export const reportStatusSchema = z.object({
// ตรวจ Body ตอน Admin จบการจัดการ Report
  status: z.enum(["resolved", "rejected"], {
  // ไม่รับ pending เพราะ Report ใหม่ถูกตั้ง pending อัตโนมัติอยู่แล้ว
    message: "status ต้องเป็น resolved หรือ rejected",
  }),
});
