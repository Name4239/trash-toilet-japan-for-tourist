import { prisma } from "../lib/prisma.js"; // ลำดับอ่าน 4D: reportRoutes และ Middleware ส่ง request มาที่ไฟล์นี้ | ฟังก์ชันในนี้ตรวจข้อมูล Report → ใช้ prisma → ส่ง JSON กลับ Frontend | ความสัมพันธ์ Report/User/Place ดูต่อได้ใน prisma/schema.prisma
import fs from "fs"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import path from "path"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

const reportStatuses = ["pending", "resolved", "rejected"]; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

export async function createReport(req, res) { // POST /api/reports สำหรับ Member และ Admin ที่ Login แล้ว
  try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const { placeId, reason, description } = req.body; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
    const parsedPlaceId = Number(placeId); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

    if (!Number.isInteger(parsedPlaceId) || !reason) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "กรุณาส่ง placeId และ reason" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    if (!req.file) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "กรุณาแนบรูปหลักฐาน" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const place = await prisma.place.findUnique({ // ตรวจว่าสถานที่มีอยู่จริงก่อนสร้าง Report
      where: { id: parsedPlaceId },
    });

    if (!place) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(404).json({ message: "ไม่พบสถานที่" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const report = await prisma.report.create({ // ไม่รับ status จากผู้ใช้ เพราะ Report ใหม่ต้องเริ่มเป็น pending เสมอ
      data: {
        placeId: parsedPlaceId,
        reporterId: req.user.userId,
        reason,
        description: description || null,
        evidenceImageUrl: `/uploads/${req.file.filename}`,
        status: "pending",
      },
    });

    return res.status(201).json({ message: "ส่ง Report สำเร็จ", report }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}

export async function getReports(req, res) { // GET /api/reports สำหรับหน้า Admin Reports
  try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const { status } = req.query; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

    if (status && !reportStatuses.includes(status)) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "status ไม่ถูกต้อง" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const reports = await prisma.report.findMany({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: status ? { status } : {},
      include: {
        place: true,
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ reports }); // ส่งข้อมูล JSON กลับ Postman หรือ Frontend
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}

export async function getReportById(req, res) { // GET /api/reports/:id สำหรับหน้า Admin Report Detail
  try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const id = Number(req.params.id); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

    if (!Number.isInteger(id)) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "Report id ไม่ถูกต้อง" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const report = await prisma.report.findUnique({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: { id },
      include: {
        place: true,
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(404).json({ message: "ไม่พบ Report" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    return res.json({ report }); // ส่งข้อมูล JSON กลับ Postman หรือ Frontend
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}

export async function updateReportStatus(req, res) { // PATCH /api/reports/:id/status สำหรับ Admin จบหรือปฏิเสธ Report
  try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
    const id = Number(req.params.id); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
    const { status } = req.body; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

    if (!Number.isInteger(id) || !["resolved", "rejected"].includes(status)) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(400).json({ message: "status ต้องเป็น resolved หรือ rejected" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const existingReport = await prisma.report.findUnique({ where: { id } }); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป

    if (!existingReport) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      return res.status(404).json({ message: "ไม่พบ Report" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
    }

    const report = await prisma.report.update({ // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      where: { id },
      data: { status },
    });

    if (existingReport.evidenceImageUrl) { // รูปใช้ยืนยันก่อนจัดการเท่านั้น จึงลบไฟล์เมื่อ Report จบแล้ว
      const evidencePath = path.resolve(existingReport.evidenceImageUrl.replace(/^\//, "")); // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
      if (fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath); // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      await prisma.report.update({ where: { id }, data: { evidenceImageUrl: null } }); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
    }

    return res.json({ message: "เปลี่ยนสถานะ Report สำเร็จ", report }); // ส่งข้อมูล JSON กลับ Postman หรือ Frontend
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }
}
