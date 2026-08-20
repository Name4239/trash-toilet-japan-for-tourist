// ลำดับอ่าน 2A: มาจาก server.js ที่ URL /api/auth
// อ่าน Route จากบนลงล่าง แล้วไปต่อที่ controllers/authController.js
import express from "express";
import { login, register } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { loginSchema, registerSchema } from "../validations/schemas.js";

const router = express.Router();

// Route รับ request แล้วส่งต่อไปยังฟังก์ชันใน Controller
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
