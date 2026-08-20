// ลำดับอ่าน 1: เริ่มที่ไฟล์นี้ เพราะเป็นประตูหลักของ Backend
// จากไฟล์นี้ให้ดู app.use(...) แล้วไปอ่านไฟล์ใน src/routes/ ตามชื่อ Route
// โหลดค่าจาก .env ก่อนเริ่มใช้งาน PORT และ JWT_SECRET
import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";

import authRoutes from "./routes/authRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// app คือ Express application ที่รับ request จาก Frontend/Postman
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [FRONTEND_URL, "http://127.0.0.1:5173"];

// ใช้ทดสอบผ่านมือถือที่ต่อ Wi-Fi วงเดียวกัน เช่น http://192.168.1.36:5173
function isLocalNetworkOrigin(origin) {
  return /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)[\d.]+:\d+$/.test(origin);
}

// อนุญาตให้ React Frontend คนละ Port เรียก Backend ได้
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (
    requestOrigin &&
    (allowedOrigins.includes(requestOrigin) ||
      isLocalNetworkOrigin(requestOrigin))
  ) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  // Browser ส่ง OPTIONS มาก่อน request จริง จึงตอบกลับทันที
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// อ่าน JSON Body ก่อนส่ง request ต่อไปยัง Routes
app.use(express.json());

// เปิดให้ Frontend โหลดรูปที่เก็บใน BackEnd/uploads ผ่าน URL /uploads/ชื่อไฟล์
app.use("/uploads", express.static(path.resolve("uploads")));

// เชื่อม URL แต่ละกลุ่มเข้ากับไฟล์ Route ของตัวเอง
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/reports", reportRoutes);

// รับ error จาก Multer เช่น ไฟล์ใหญ่เกิน 5 MB หรือไม่ใช่รูปภาพ
app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

// Route ง่าย ๆ สำหรับตรวจว่า Backend เปิดอยู่หรือไม่
app.get("/", (req, res) => {
  if (!fs.existsSync(path.resolve("../FrontEnd/dist/index.html"))) {
    return res.json({ message: "Trash & Toilet Japan API is running" });
  }
  return res.sendFile(path.resolve("../FrontEnd/dist/index.html"));
});

// ใช้ Backend เสิร์ฟ React build เพื่อให้แชร์ผ่าน Tunnel เพียง URL เดียว
const frontendDist = path.resolve("../FrontEnd/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api\/|\/uploads\/).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ถ้าไม่มี Route ใดตรงกับ URL ที่เรียก จะตอบ 404 เป็น JSON
app.use((req, res) => {
  res.status(404).json({ message: "ไม่พบ API ที่เรียก" });
});

// เริ่ม Server เป็นลำดับสุดท้าย หลัง Middleware และ Routes พร้อมแล้ว
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
