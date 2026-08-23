import "dotenv/config"; // ลำดับอ่าน 1: เริ่มที่ไฟล์นี้ เพราะเป็นประตูหลักของ Backend | จากไฟล์นี้ให้ดู app.use(...) แล้วไปอ่านไฟล์ใน src/routes/ ตามชื่อ Route | โหลดค่าจาก .env ก่อนเริ่มใช้งาน PORT และ JWT_SECRET
import fs from "fs"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import path from "path"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import express from "express"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

import authRoutes from "./routes/authRoutes.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import placeRoutes from "./routes/placeRoutes.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import reportRoutes from "./routes/reportRoutes.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import userRoutes from "./routes/userRoutes.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

const app = express(); // app คือ Express application ที่รับ request จาก Frontend/Postman
const PORT = process.env.PORT || 5000; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
const allowedOrigins = [FRONTEND_URL, "http://127.0.0.1:5173"]; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

function isLocalNetworkOrigin(origin) { // ใช้ทดสอบผ่านมือถือที่ต่อ Wi-Fi วงเดียวกัน เช่น http://192.168.1.36:5173
  return /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)[\d.]+:\d+$/.test(origin); // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
}

app.use((req, res, next) => { // อนุญาตให้ React Frontend คนละ Port เรียก Backend ได้
  const requestOrigin = req.headers.origin; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

  if ( // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    requestOrigin &&
    (allowedOrigins.includes(requestOrigin) ||
      isLocalNetworkOrigin(requestOrigin))
  ) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") { // Browser ส่ง OPTIONS มาก่อน request จริง จึงตอบกลับทันที
    return res.sendStatus(204); // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
  }

  next();
});

app.use(express.json()); // อ่าน JSON Body ก่อนส่ง request ต่อไปยัง Routes

app.use("/uploads", express.static(path.resolve("uploads"))); // เปิดให้ Frontend โหลดรูปที่เก็บใน BackEnd/uploads ผ่าน URL /uploads/ชื่อไฟล์

app.use("/api/auth", authRoutes); // เชื่อม URL แต่ละกลุ่มเข้ากับไฟล์ Route ของตัวเอง
app.use("/api/users", userRoutes); // ติดตั้ง Middleware หรือ Route ให้ Express ตามลำดับจากบนลงล่าง
app.use("/api/places", placeRoutes); // ติดตั้ง Middleware หรือ Route ให้ Express ตามลำดับจากบนลงล่าง
app.use("/api/reports", reportRoutes); // ติดตั้ง Middleware หรือ Route ให้ Express ตามลำดับจากบนลงล่าง

app.use((error, req, res, next) => { // รับ error จาก Multer เช่น ไฟล์ใหญ่เกิน 5 MB หรือไม่ใช่รูปภาพ
  if (error) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    return res.status(400).json({ message: error.message }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }

  next();
});

app.get("/", (req, res) => { // Route ง่าย ๆ สำหรับตรวจว่า Backend เปิดอยู่หรือไม่
  if (!fs.existsSync(path.resolve("../FrontEnd/dist/index.html"))) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    return res.json({ message: "Trash & Toilet Japan API is running" }); // ส่งข้อมูล JSON กลับ Postman หรือ Frontend
  }
  return res.sendFile(path.resolve("../FrontEnd/dist/index.html")); // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
});

const frontendDist = path.resolve("../FrontEnd/dist"); // ใช้ Backend เสิร์ฟ React build เพื่อให้แชร์ผ่าน Tunnel เพียง URL เดียว
if (fs.existsSync(frontendDist)) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
  app.use(express.static(frontendDist)); // ติดตั้ง Middleware หรือ Route ให้ Express ตามลำดับจากบนลงล่าง
  app.get(/^(?!\/api\/|\/uploads\/).*/, (req, res) => { // ประกาศ GET Endpoint สำหรับตอบ Request ที่ URL นี้
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((req, res) => { // ถ้าไม่มี Route ใดตรงกับ URL ที่เรียก จะตอบ 404 เป็น JSON
  res.status(404).json({ message: "ไม่พบ API ที่เรียก" });
});

app.listen(PORT, () => { // เริ่ม Server เป็นลำดับสุดท้าย หลัง Middleware และ Routes พร้อมแล้ว
  console.log(`Server is running at http://localhost:${PORT}`);
});
