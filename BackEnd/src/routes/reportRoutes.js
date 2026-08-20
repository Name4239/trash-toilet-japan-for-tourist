// ลำดับอ่าน 2D: มาจาก server.js ที่ URL /api/reports
// Report ทุก Route ผ่าน authMiddleware และ Route ของ Admin ผ่าน adminMiddleware เพิ่ม
// จากนั้นผ่าน Zod Validation แล้วไปอ่าน controllers/reportController.js
import express from "express";
import {
  createReport,
  getReportById,
  getReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { uploadReportEvidence } from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createReportSchema,
  reportIdSchema,
  reportsQuerySchema,
  reportStatusSchema,
} from "../validations/schemas.js";

const router = express.Router();

// Member และ Admin ส่ง Report ได้ แต่ Report ใหม่จะเป็น pending เสมอ
router.post(
  "/",
  authMiddleware,
  uploadReportEvidence,
  validate(createReportSchema),
  createReport
);

// การอ่านและจัดการ Report เป็นสิทธิ์ของ Admin
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(reportsQuerySchema, "query"),
  getReports
);
router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(reportIdSchema, "params"),
  getReportById
);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(reportIdSchema, "params"),
  validate(reportStatusSchema),
  updateReportStatus
);

export default router;
