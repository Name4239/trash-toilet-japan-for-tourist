// ลำดับอ่าน 2B: มาจาก server.js ที่ URL /api/users
// Flow ไป authMiddleware ก่อน แล้วจึงอ่าน User หรือเปลี่ยน Avatar ที่ userController
import express from "express";
import { getMe, updateAvatar } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploadAvatar } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ลำดับ: รับ GET /me → ตรวจ Token → เรียก getMe
router.get("/me", authMiddleware, getMe);
router.patch("/me/avatar", authMiddleware, uploadAvatar, updateAvatar);

export default router;
