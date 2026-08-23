import express from "express";
// ลำดับอ่าน 2D: มาจาก server.js ที่ URL /api/reports | Report ทุก Route ผ่าน authMiddleware และ Route ของ Admin ผ่าน adminMiddleware เพิ่ม | จากนั้นผ่าน Zod Validation แล้วไปอ่าน controllers/reportController.js
import {
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
  createReport,
  getReportById,
  getReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { uploadReportEvidence } from "../middlewares/uploadMiddleware.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { validate } from "../middlewares/validateMiddleware.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import {
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
  createReportSchema,
  reportIdSchema,
  reportsQuerySchema,
  reportStatusSchema,
} from "../validations/schemas.js";

const router = express.Router();
// ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

router.post(
  // Member และ Admin ส่ง Report ได้ แต่ Report ใหม่จะเป็น pending เสมอ
  "/",
  // กำหนด path "/" ซึ่งจะนำไปต่อกับ URL หลักที่ประกาศไว้ใน server.js
  authMiddleware,
  // ตรวจ Bearer Token; ถ้าไม่มีหรือไม่ถูกต้องจะตอบ 401 และหยุดก่อนขั้นถัดไป
  uploadReportEvidence,
  // รับไฟล์จาก multipart/form-data แล้วบันทึกข้อมูลไฟล์ไว้ให้ Controller ใช้งาน
  validate(createReportSchema),
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ถ้าไม่ผ่านจะตอบ 400 ก่อนเข้า Controller
  createReport
  // เรียก createReport เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);

router.get(
  // การอ่านและจัดการ Report เป็นสิทธิ์ของ Admin
  "/",
  // กำหนด path "/" ซึ่งจะนำไปต่อกับ URL หลักที่ประกาศไว้ใน server.js
  authMiddleware,
  // ตรวจ Bearer Token; ถ้าไม่มีหรือไม่ถูกต้องจะตอบ 401 และหยุดก่อนขั้นถัดไป
  adminMiddleware,
  // ตรวจว่าผู้ใช้มี role เป็น Admin; ถ้าไม่ใช่จะตอบ 403
  validate(reportsQuerySchema, "query"),
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ถ้าไม่ผ่านจะตอบ 400 ก่อนเข้า Controller
  getReports
  // เรียก getReports เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);
router.get(
  // ประกาศ Method และ URL แล้วเรียง Middleware ก่อน Controller
  "/:id",
  // กำหนด path "/:id" ซึ่งจะนำไปต่อกับ URL หลักที่ประกาศไว้ใน server.js
  authMiddleware,
  // ตรวจ Bearer Token; ถ้าไม่มีหรือไม่ถูกต้องจะตอบ 401 และหยุดก่อนขั้นถัดไป
  adminMiddleware,
  // ตรวจว่าผู้ใช้มี role เป็น Admin; ถ้าไม่ใช่จะตอบ 403
  validate(reportIdSchema, "params"),
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ถ้าไม่ผ่านจะตอบ 400 ก่อนเข้า Controller
  getReportById
  // เรียก getReportById เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);
router.patch(
  // ประกาศ Method และ URL แล้วเรียง Middleware ก่อน Controller
  "/:id/status",
  // กำหนด path "/:id/status" ซึ่งจะนำไปต่อกับ URL หลักที่ประกาศไว้ใน server.js
  authMiddleware,
  // ตรวจ Bearer Token; ถ้าไม่มีหรือไม่ถูกต้องจะตอบ 401 และหยุดก่อนขั้นถัดไป
  adminMiddleware,
  // ตรวจว่าผู้ใช้มี role เป็น Admin; ถ้าไม่ใช่จะตอบ 403
  validate(reportIdSchema, "params"),
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ถ้าไม่ผ่านจะตอบ 400 ก่อนเข้า Controller
  validate(reportStatusSchema),
  // ตรวจข้อมูลด้วย Zod Schema ที่ระบุ; ถ้าไม่ผ่านจะตอบ 400 ก่อนเข้า Controller
  updateReportStatus
  // เรียก updateReportStatus เป็นขั้นตอนสุดท้าย เพื่อประมวลผลและส่ง Response กลับ
);

export default router;
