import fs from "fs";
// Route เรียกไฟล์นี้หลัง Auth เพื่อรับรูปจาก multipart/form-data | fs ใช้สร้างโฟลเดอร์สำหรับเก็บไฟล์บนเครื่อง Server

import path from "path";
// path ใช้สร้าง Path และอ่านนามสกุลไฟล์ให้รองรับทุกระบบปฏิบัติการ

import multer from "multer";
// multer รับไฟล์ multipart/form-data จาก Frontend

const uploadDirectory = path.resolve("uploads");
// เปลี่ยน "uploads" เป็น Absolute path | เมื่อรัน npm run dev จาก BackEnd จะชี้ไปที่ BackEnd/uploads

fs.mkdirSync(uploadDirectory, { recursive: true });
// สร้างโฟลเดอร์ uploads ก่อน Multer บันทึกไฟล์ | recursive: true สร้างโฟลเดอร์แม่ที่ขาดและไม่ Error ถ้ามีอยู่แล้ว

function createStorage(prefix) {
// รับ prefix เพื่อแยกประเภทชื่อไฟล์ เช่น place, avatar หรือ report
  return multer.diskStorage({
  // diskStorage กำหนดให้ Multer บันทึกไฟล์จริงลง Disk
    destination: (req, file, callback) => {
    // destination ทำงานเมื่อมีไฟล์เข้า และเลือกโฟลเดอร์ปลายทาง
      callback(null, uploadDirectory);
      // null หมายถึงไม่มี Error ส่วนค่าที่สองคือโฟลเดอร์เก็บไฟล์
    },
    filename: (req, file, callback) => {
    // filename เปลี่ยนชื่อไฟล์ก่อนบันทึก ป้องกันใช้ชื่อจากผู้ใช้โดยตรง
      const extension =
      // อ่านนามสกุลจากชื่อเดิมและเปลี่ยนเป็นตัวเล็ก; ถ้าไม่มีให้ใช้ .jpg
        path.extname(file.originalname).toLowerCase() || ".jpg";
      callback(
      // รูปแบบชื่อ: prefix-เวลา-เลขสุ่ม.นามสกุล ช่วยลดโอกาสชื่อชนกัน
        null,
        `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
      );
    },
  });
}

function createUpload(prefix) {
// สร้าง Multer middleware โดยรับ prefix สำหรับตั้งชื่อไฟล์แต่ละประเภท
  return multer({
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    storage: createStorage(prefix),
    // ใช้กฎโฟลเดอร์และชื่อไฟล์จาก createStorage()
    limits: { fileSize: 5 * 1024 * 1024 },
    // จำกัดขนาดไฟล์ไม่เกิน 5 MB
    fileFilter: (req, file, callback) => {
    // ตรวจ MIME type ก่อนอนุญาตให้บันทึกไฟล์
      if (!file.mimetype.startsWith("image/")) {
      // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
        return callback(new Error("อัปโหลดได้เฉพาะไฟล์รูปภาพ"));
        // ส่ง Error และหยุดอัปโหลดเมื่อไม่ใช่รูปภาพ
      }

      callback(null, true);
      // null = ไม่มี Error, true = ยอมรับไฟล์นี้
    },
  });
}

export const uploadPlaceImage = createUpload("place").single("image");
// image คือชื่อ field ที่ Frontend ต้องใช้ใน FormData

export const uploadAvatar = createUpload("avatar").single("avatar");
// avatar คือชื่อ field สำหรับรูปโปรไฟล์

export const uploadReportEvidence = createUpload("report").single("evidence");
// evidence คือรูปหลักฐานที่แนบมากับ Report และจะถูกลบหลัง Admin จัดการ
