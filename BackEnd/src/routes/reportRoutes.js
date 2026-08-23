import express from "express"; // ลำดับอ่าน 2D: มาจาก server.js ที่ URL /api/reports | Report ทุก Route ผ่าน authMiddleware และ Route ของ Admin ผ่าน adminMiddleware เพิ่ม | จากนั้นผ่าน Zod Validation แล้วไปอ่าน controllers/reportController.js
import { // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
  createReport,
  getReportById,
  getReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { adminMiddleware } from "../middlewares/adminMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { uploadReportEvidence } from "../middlewares/uploadMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { validate } from "../middlewares/validateMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
  createReportSchema,
  reportIdSchema,
  reportsQuerySchema,
  reportStatusSchema,
} from "../validations/schemas.js";

const router = express.Router(); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

router.post( // Member และ Admin ส่ง Report ได้ แต่ Report ใหม่จะเป็น pending เสมอ
  "/",
  authMiddleware,
  uploadReportEvidence,
  validate(createReportSchema),
  createReport
);

router.get( // การอ่านและจัดการ Report เป็นสิทธิ์ของ Admin
  "/",
  authMiddleware,
  adminMiddleware,
  validate(reportsQuerySchema, "query"),
  getReports
);
router.get( // ประกาศ Method และ URL แล้วเรียง Middleware ก่อน Controller
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(reportIdSchema, "params"),
  getReportById
);
router.patch( // ประกาศ Method และ URL แล้วเรียง Middleware ก่อน Controller
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(reportIdSchema, "params"),
  validate(reportStatusSchema),
  updateReportStatus
);

export default router;
