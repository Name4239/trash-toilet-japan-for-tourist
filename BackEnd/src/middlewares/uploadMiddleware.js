// Route เรียกไฟล์นี้หลัง Auth เพื่อรับรูปจาก multipart/form-data
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve("uploads");

// สร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
fs.mkdirSync(uploadDirectory, { recursive: true });

function createStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, callback) => callback(null, uploadDirectory),
    filename: (req, file, callback) => {
      // ใช้เวลา + เลขสุ่ม ป้องกันชื่อไฟล์ชนกัน
      const extension =
        path.extname(file.originalname).toLowerCase() || ".jpg";
      callback(
        null,
        `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
      );
    },
  });
}

function createUpload(prefix) {
  return multer({
    storage: createStorage(prefix),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith("image/")) {
        return callback(new Error("อัปโหลดได้เฉพาะไฟล์รูปภาพ"));
      }

      callback(null, true);
    },
  });
}

// image คือชื่อ field ที่ Frontend ต้องใช้ใน FormData
export const uploadPlaceImage = createUpload("place").single("image");

// avatar คือชื่อ field สำหรับรูปโปรไฟล์
export const uploadAvatar = createUpload("avatar").single("avatar");

// evidence คือรูปหลักฐานที่แนบมากับ Report และจะถูกลบหลัง Admin จัดการ
export const uploadReportEvidence = createUpload("report").single("evidence");
