import express from "express";
// ลำดับอ่าน 2C: มาจาก server.js ที่ URL /api/places | แต่ละบรรทัดเรียงเป็น Route → Auth → Zod Validation → Controller | อ่านต่อที่ middlewares/, validations/ แล้วจบที่ controllers/placeController.js | นำ Express มาใช้สร้าง Router แยกสำหรับ URL กลุ่ม /api/places
import {
// เริ่มรวมรายชื่อฟังก์ชันที่ไฟล์นี้ต้องนำเข้าจากอีก Module
  createPlace,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  deletePlace,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  getNearbyPlaces,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  getPendingPlaces,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  getPlaceById,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  getPlaces,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  updatePlaceStatus,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
} from "../controllers/placeController.js";
// นำ Controller ของ Place เข้ามาเป็นขั้นตอนสุดท้ายของแต่ละ Route
import {
// เริ่มรวมรายชื่อฟังก์ชันที่ไฟล์นี้ต้องนำเข้าจากอีก Module
  authMiddleware,
  // ตรวจ Bearer Token; ไม่ผ่านจะตอบ 401 และไม่ทำขั้นถัดไป
  optionalAuthMiddleware,
  // อ่าน Token ถ้ามี เพื่อให้ getPlaces รู้ว่าเป็น Admin แต่คนทั่วไปยังเปิดรายการได้
} from "../middlewares/authMiddleware.js";
// นำ Middleware ตรวจ Token ทั้งแบบบังคับและแบบไม่บังคับมาใช้
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
// นำ Middleware ตรวจ role admin มาใช้ป้องกัน Route ฝั่งผู้ดูแล
import { uploadPlaceImage } from "../middlewares/uploadMiddleware.js";
// นำ Multer middleware สำหรับรับรูป field image มาใช้ก่อนสร้าง Place
import { validate } from "../middlewares/validateMiddleware.js";
// นำฟังก์ชัน validate มาเชื่อม Zod Schema กับ Request
import {
// เริ่มรวมรายชื่อฟังก์ชันที่ไฟล์นี้ต้องนำเข้าจากอีก Module
  createPlaceSchema,
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  nearbyQuerySchema,
  // ตรวจ latitude, longitude และ radius
  placeIdSchema,
  // ตรวจ :id จาก URL ให้เป็นจำนวนเต็มบวก
  placesQuerySchema,
  // ตรวจ type, search และ status ของหน้ารายการ
  placeStatusSchema,
  // ตรวจ status ใหม่ตอน Admin อัปเดต
} from "../validations/schemas.js";
// นำ Schema ของ Place มาใช้ตรวจ body, params และ query ก่อนเข้า Controller
const router = express.Router();
// สร้าง Router ของ Place เพื่อส่งออกไป mount ที่ /api/places ใน server.js
router.get("/nearby", validate(nearbyQuerySchema, "query"), getNearbyPlaces);
// Route คำเฉพาะต้องอยู่ก่อน /:id ไม่เช่นนั้น Express จะคิดว่า nearby คือ id
router.get("/pending", authMiddleware, adminMiddleware, getPendingPlaces);
// นำ Middleware ตรวจ role admin มาใช้ป้องกัน Route ฝั่งผู้ดูแล
router.get(
  // เริ่มประกาศ GET Route สำหรับอ่านข้อมูล Place
  "/",
  // ใช้ path "/" เมื่อรวมกับ /api/places ใน server.js จะได้ GET /api/places
  optionalAuthMiddleware,
  // อ่าน Token แบบไม่บังคับ เพื่อให้คนทั่วไปดูรายการได้ และให้ Controller รู้เมื่อผู้ใช้เป็น Admin
  validate(placesQuerySchema, "query"),
  // ตรวจ query เช่น type, search และ status; ถ้าไม่ผ่าน Schema จะตอบ 400 ก่อนเข้า Controller
  getPlaces
  // ดึงรายการ Place จาก Database แล้วส่งผลลัพธ์กลับไปยังผู้เรียก API
);
router.get("/:id", validate(placeIdSchema, "params"), getPlaceById);
// เริ่มประกาศ GET Route สำหรับอ่านข้อมูล Place
router.post(
  // เริ่มประกาศ POST Route สำหรับสร้าง Place ใหม่
  // รวมกับ /api/places เป็น POST /api/places
  "/",
  // ตรวจ Bearer Token; ไม่ผ่านจะตอบ 401 และไม่ทำขั้นถัดไป
  authMiddleware,
  // นำ Multer middleware สำหรับรับรูป field image มาใช้ก่อนสร้าง Place
  uploadPlaceImage,
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ไม่ผ่านจะตอบ 400 ก่อน Controller
  validate(createPlaceSchema),
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  createPlace
  // เรียก createPlace เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);
router.delete(
  // เริ่มประกาศ DELETE Route สำหรับให้ Admin ลบ Place
  // เช่น DELETE /api/places/12 โดย 12 อยู่ใน req.params.id
  "/:id",
  // ตรวจ Bearer Token; ไม่ผ่านจะตอบ 401 และไม่ทำขั้นถัดไป
  authMiddleware,
  // นำ Middleware ตรวจ role admin มาใช้ป้องกัน Route ฝั่งผู้ดูแล
  adminMiddleware,
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ไม่ผ่านจะตอบ 400 ก่อน Controller
  validate(placeIdSchema, "params"),
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  deletePlace
  // เรียก deletePlace เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);
router.patch(
  // เริ่มประกาศ PATCH Route สำหรับให้ Admin เปลี่ยนสถานะ Place
  // เช่น PATCH /api/places/12/status
  "/:id/status",
  // ตรวจ Bearer Token; ไม่ผ่านจะตอบ 401 และไม่ทำขั้นถัดไป
  authMiddleware,
  // นำ Middleware ตรวจ role admin มาใช้ป้องกัน Route ฝั่งผู้ดูแล
  adminMiddleware,
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ไม่ผ่านจะตอบ 400 ก่อน Controller
  validate(placeIdSchema, "params"),
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ไม่ผ่านจะตอบ 400 ก่อน Controller
  validate(placeStatusSchema),
  // เรียก Controller นี้เป็นขั้นตอนสุดท้ายเมื่อ Middleware ก่อนหน้าผ่านทั้งหมด
  updatePlaceStatus
  // เรียก updatePlaceStatus เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);
export default router;
// ส่ง Router ออกไปให้ server.js import และ mount ใช้งาน