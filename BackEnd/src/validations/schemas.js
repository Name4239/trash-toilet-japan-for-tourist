// ลำดับอ่าน 3D: ไฟล์รวมกติกาข้อมูลที่ Routes ส่งให้ validateMiddleware
// Schema บอกว่า field ใดจำเป็น เป็นชนิดใด และอนุญาตค่าอะไรบ้าง
import { z } from "zod";

// Register รับข้อมูลจาก POST /api/auth/register
export const registerSchema = z.object({
  // trim() ตัดช่องว่างหัวท้าย และห้ามชื่อว่างหรือยาวเกิน 100 ตัวอักษร
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100, "ชื่อยาวเกินไป"),
  // ตรวจรูปแบบ email และเปลี่ยนเป็นตัวพิมพ์เล็กก่อนส่งให้ Controller
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").toLowerCase(),
  // รหัสผ่านต้องเป็นข้อความและยาวอย่างน้อย 6 ตัวอักษร
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

// Login รับข้อมูลจาก POST /api/auth/login
export const loginSchema = z.object({
  // จัดรูป email ให้เหมือนตอน Register เพื่อค้นหาใน Database ได้ตรงกัน
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง").toLowerCase(),
  // Login ตรวจเพียงว่ามี password ส่วน bcrypt จะตรวจว่าถูกต้องใน Controller
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

// ตรวจ :id ใน URL ของ Place เช่น /api/places/1
export const placeIdSchema = z.object({
  // Params เริ่มเป็น string จึงใช้ coerce แปลงเป็นเลขจำนวนเต็มบวก
  id: z.coerce.number().int().positive("Place id ต้องมากกว่า 0"),
});

// ตรวจ Body ตอน Member/Admin เพิ่มสถานที่
export const createPlaceSchema = z.object({
  // ชื่อและที่อยู่ต้องไม่ว่าง พร้อมจำกัดความยาวไม่ให้ข้อมูลใหญ่เกินไป
  name: z.string().trim().min(1, "กรุณากรอกชื่อสถานที่").max(150),
  // enum อนุญาตเฉพาะประเภทที่ schema.prisma กำหนดไว้
  type: z.enum(["toilet", "trash"], {
    message: "type ต้องเป็น toilet หรือ trash",
  }),
  address: z.string().trim().min(1, "กรุณากรอกที่อยู่").max(255),
  // latitude อยู่ระหว่าง -90 ถึง 90 และ longitude อยู่ระหว่าง -180 ถึง 180
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

// ตรวจ Query ของ GET /api/places เช่น ?type=toilet&status=active
export const placesQuerySchema = z.object({
  // optional() หมายถึงไม่ส่ง field นี้มาก็ได้
  type: z.enum(["toilet", "trash"]).optional(),
  search: z.string().trim().max(150).optional(),
  // all ใช้สำหรับ Admin ขอดู Place ทุกสถานะ โดย Controller จะตรวจ role อีกครั้ง
  status: z
    .enum(["pending", "active", "rejected", "inactive", "all"])
    .optional(),
});

// ตรวจ GPS Query ของ GET /api/places/nearby
export const nearbyQuerySchema = z.object({
  // Query เป็น string จึงใช้ coerce แปลงเป็น number ก่อนตรวจช่วงพิกัด
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  // radius เป็นกิโลเมตร ต้องมากกว่า 0 และจำกัดสูงสุดไว้ที่ 100 กิโลเมตร
  radius: z.coerce.number().positive().max(100).optional(),
});

// ตรวจ Body ตอน Admin เปลี่ยนสถานะ Place
export const placeStatusSchema = z.object({
  // รับเฉพาะค่าที่มีอยู่ใน PlaceStatus ของ schema.prisma
  status: z.enum(["pending", "active", "rejected", "inactive"]),
});

// ตรวจ Body ตอน Member/Admin ส่ง Report
export const createReportSchema = z.object({
  // placeId ต้องเป็น ID ของ Place และ Controller จะตรวจต่อว่า Place มีจริงหรือไม่
  placeId: z.coerce.number().int().positive(),
  // reason จำเป็น ส่วน description ไม่จำเป็น
  reason: z.string().trim().min(1, "กรุณากรอกเหตุผล").max(100),
  description: z.string().trim().max(1000).optional(),
});

// ตรวจ Query สำหรับ Admin กรองรายการ Report ตาม status
export const reportsQuerySchema = z.object({
  status: z.enum(["pending", "resolved", "rejected"]).optional(),
});

// ตรวจ :id ใน URL ของ Report เช่น /api/reports/1
export const reportIdSchema = z.object({
  id: z.coerce.number().int().positive("Report id ต้องมากกว่า 0"),
});

// ตรวจ Body ตอน Admin จบการจัดการ Report
export const reportStatusSchema = z.object({
  // ไม่รับ pending เพราะ Report ใหม่ถูกตั้ง pending อัตโนมัติอยู่แล้ว
  status: z.enum(["resolved", "rejected"], {
    message: "status ต้องเป็น resolved หรือ rejected",
  }),
});
