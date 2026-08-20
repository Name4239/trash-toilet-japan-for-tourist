// ลำดับอ่าน 4D: reportRoutes และ Middleware ส่ง request มาที่ไฟล์นี้
// ฟังก์ชันในนี้ตรวจข้อมูล Report → ใช้ prisma → ส่ง JSON กลับ Frontend
// ความสัมพันธ์ Report/User/Place ดูต่อได้ใน prisma/schema.prisma
import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

const reportStatuses = ["pending", "resolved", "rejected"];

// POST /api/reports สำหรับ Member และ Admin ที่ Login แล้ว
export async function createReport(req, res) {
  try {
    const { placeId, reason, description } = req.body;
    const parsedPlaceId = Number(placeId);

    if (!Number.isInteger(parsedPlaceId) || !reason) {
      return res.status(400).json({ message: "กรุณาส่ง placeId และ reason" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "กรุณาแนบรูปหลักฐาน" });
    }

    // ตรวจว่าสถานที่มีอยู่จริงก่อนสร้าง Report
    const place = await prisma.place.findUnique({
      where: { id: parsedPlaceId },
    });

    if (!place) {
      return res.status(404).json({ message: "ไม่พบสถานที่" });
    }

    // ไม่รับ status จากผู้ใช้ เพราะ Report ใหม่ต้องเริ่มเป็น pending เสมอ
    const report = await prisma.report.create({
      data: {
        placeId: parsedPlaceId,
        reporterId: req.user.userId,
        reason,
        description: description || null,
        evidenceImageUrl: `/uploads/${req.file.filename}`,
        status: "pending",
      },
    });

    return res.status(201).json({ message: "ส่ง Report สำเร็จ", report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// GET /api/reports สำหรับหน้า Admin Reports
export async function getReports(req, res) {
  try {
    const { status } = req.query;

    if (status && !reportStatuses.includes(status)) {
      return res.status(400).json({ message: "status ไม่ถูกต้อง" });
    }

    const reports = await prisma.report.findMany({
      where: status ? { status } : {},
      include: {
        place: true,
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// GET /api/reports/:id สำหรับหน้า Admin Report Detail
export async function getReportById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Report id ไม่ถูกต้อง" });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        place: true,
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ message: "ไม่พบ Report" });
    }

    return res.json({ report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// PATCH /api/reports/:id/status สำหรับ Admin จบหรือปฏิเสธ Report
export async function updateReportStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || !["resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status ต้องเป็น resolved หรือ rejected" });
    }

    const existingReport = await prisma.report.findUnique({ where: { id } });

    if (!existingReport) {
      return res.status(404).json({ message: "ไม่พบ Report" });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    // รูปใช้ยืนยันก่อนจัดการเท่านั้น จึงลบไฟล์เมื่อ Report จบแล้ว
    if (existingReport.evidenceImageUrl) {
      const evidencePath = path.resolve(existingReport.evidenceImageUrl.replace(/^\//, ""));
      if (fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
      await prisma.report.update({ where: { id }, data: { evidenceImageUrl: null } });
    }

    return res.json({ message: "เปลี่ยนสถานะ Report สำเร็จ", report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}
