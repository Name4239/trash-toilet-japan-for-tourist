import express from "express"; // ลำดับอ่าน 2B: มาจาก server.js ที่ URL /api/users | Flow ไป authMiddleware ก่อน แล้วจึงอ่าน User หรือเปลี่ยน Avatar ที่ userController
import { getMe, updateAvatar } from "../controllers/userController.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { authMiddleware } from "../middlewares/authMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { uploadAvatar } from "../middlewares/uploadMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

const router = express.Router(); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

router.get("/me", authMiddleware, getMe); // ลำดับ: รับ GET /me → ตรวจ Token → เรียก getMe
router.patch("/me/avatar", authMiddleware, uploadAvatar, updateAvatar); // ประกาศ Method และ URL แล้วเรียง Middleware ก่อน Controller

export default router;
