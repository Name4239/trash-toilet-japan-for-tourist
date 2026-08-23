import express from "express"; // ลำดับอ่าน 2A: มาจาก server.js ที่ URL /api/auth | อ่าน Route จากบนลงล่าง แล้วไปต่อที่ controllers/authController.js
import { login, register } from "../controllers/authController.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { validate } from "../middlewares/validateMiddleware.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { loginSchema, registerSchema } from "../validations/schemas.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

const router = express.Router(); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

router.post("/register", validate(registerSchema), register); // Route รับ request แล้วส่งต่อไปยังฟังก์ชันใน Controller
router.post("/login", validate(loginSchema), login); // ประกาศ Method และ URL แล้วเรียง Middleware ก่อน Controller

export default router;
