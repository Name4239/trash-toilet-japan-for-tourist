// ลำดับอ่าน 4C: placeRoutes และ Middleware ส่ง request มาที่ไฟล์นี้
// ฟังก์ชันในนี้ทำ Logic ของ Place แล้วใช้ prisma ติดต่อ Database
// หลัง prisma ทำงาน ผลลัพธ์ถูกส่งกลับ Frontend ด้วย res.json(...)
import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

const placeTypes = ["toilet", "trash"];
const placeStatuses = ["pending", "active", "rejected", "inactive"];

// สูตรคำนวณระยะทางระหว่างพิกัดสองจุด ผลลัพธ์เป็นกิโลเมตร
function calculateDistance(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371;
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const latitudeDistance = toRadians(lat2 - lat1);
  const longitudeDistance = toRadians(lng2 - lng1);

  const value =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDistance / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

// GET /api/places ใช้แสดงสถานที่ active และใช้ค้นหาด้วย type/name
export async function getPlaces(req, res) {
  try {
    const { type, search, status } = req.query;

    if (type && !placeTypes.includes(type)) {
      return res.status(400).json({ message: "type ต้องเป็น toilet หรือ trash" });
    }

    if (status && status !== "all" && !placeStatuses.includes(status)) {
      return res.status(400).json({ message: "status ไม่ถูกต้อง" });
    }

    // เฉพาะ Admin ที่ส่ง Token เท่านั้นจึงขอดูทุกสถานะพร้อมกันได้
    if (status === "all" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "เฉพาะ Admin ที่ดูสถานที่ทั้งหมดได้" });
    }

    // ถ้าไม่ส่ง status มา จะคืนเฉพาะ active เพื่อให้หน้า Map ปลอดภัยตาม Logic
    const places = await prisma.place.findMany({
      where: {
        ...(status === "all" ? {} : { status: status || "active" }),
        ...(type ? { type } : {}),
        ...(search ? { name: { contains: search } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ places });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// GET /api/places/nearby?latitude=...&longitude=...&radius=5
export async function getNearbyPlaces(req, res) {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = Number(req.query.radius || 5);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      radius <= 0
    ) {
      return res.status(400).json({
        message: "กรุณาส่ง latitude, longitude และ radius ให้ถูกต้อง",
      });
    }

    // Marker ทุกตัวมาจาก Database และเลือกเฉพาะสถานที่ active
    const activePlaces = await prisma.place.findMany({
      where: { status: "active" },
    });

    // คำนวณระยะทาง เพิ่ม distance แล้วกรองตามรัศมี
    const places = activePlaces
      .map((place) => ({
        ...place,
        distance: calculateDistance(
          latitude,
          longitude,
          place.latitude,
          place.longitude
        ),
      }))
      .filter((place) => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return res.json({ places });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// GET /api/places/:id ใช้เปิดหน้า Place Detail
export async function getPlaceById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Place id ไม่ถูกต้อง" });
    }

    const place = await prisma.place.findUnique({ where: { id } });

    if (!place) {
      return res.status(404).json({ message: "ไม่พบสถานที่" });
    }

    return res.json({ place });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// POST /api/places ผู้ใช้ต้อง Login ก่อนจึงมาถึง Controller นี้
export async function createPlace(req, res) {
  try {
    const { name, type, address, latitude, longitude } = req.body;
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!name || !address || !placeTypes.includes(type)) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกชื่อ ประเภท และที่อยู่ให้ถูกต้อง" });
    }

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      return res.status(400).json({ message: "latitude และ longitude ต้องเป็นตัวเลข" });
    }

    // ทุกสถานที่ใหม่ต้องมีรูปจาก field image ของ multipart/form-data
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาถ่ายหรือเลือกรูปสถานที่" });
    }

    // Backend เป็นผู้กำหนด status เอง เพื่อป้องกัน Member ส่ง active มาเอง
    const status = req.user.role === "admin" ? "active" : "pending";

    const place = await prisma.place.create({
      data: {
        name,
        type,
        address,
        imageUrl: `/uploads/${req.file.filename}`,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        status,
        createdById: req.user.userId,
      },
    });

    return res.status(201).json({ message: "เพิ่มสถานที่สำเร็จ", place });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// GET /api/places/pending สำหรับหน้า Admin Pending Places
export async function getPendingPlaces(req, res) {
  try {
    const places = await prisma.place.findMany({
      where: { status: "pending" },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ places });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// PATCH /api/places/:id/status สำหรับ Admin อนุมัติ ปฏิเสธ หรือปิดสถานที่
export async function updatePlaceStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || !placeStatuses.includes(status)) {
      return res.status(400).json({ message: "Place id หรือ status ไม่ถูกต้อง" });
    }

    const existingPlace = await prisma.place.findUnique({ where: { id } });

    if (!existingPlace) {
      return res.status(404).json({ message: "ไม่พบสถานที่" });
    }

    const place = await prisma.place.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: "เปลี่ยนสถานะสำเร็จ", place });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}

// DELETE /api/places/:id สำหรับ Admin เท่านั้น
export async function deletePlace(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Place id ไม่ถูกต้อง" });
    }

    const existingPlace = await prisma.place.findUnique({
      where: { id },
      include: { reports: { select: { evidenceImageUrl: true } } },
    });

    if (!existingPlace) {
      return res.status(404).json({ message: "ไม่พบสถานที่" });
    }

    // Schema ตั้ง onDelete: Cascade จึงลบ Reports ของสถานที่นี้ตามไปด้วย
    await prisma.place.delete({ where: { id } });

    // ลบไฟล์รูปของ Place ออกจาก uploads หลังลบข้อมูลสำเร็จ
    if (existingPlace.imageUrl) {
      const imagePath = path.resolve(existingPlace.imageUrl.replace(/^\//, ""));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    // Place ถูกลบแล้ว Reports จะหายแบบ Cascade จึงลบรูปหลักฐานของ Reports ด้วย
    for (const report of existingPlace.reports) {
      if (!report.evidenceImageUrl) continue;
      const evidencePath = path.resolve(
        report.evidenceImageUrl.replace(/^\//, "")
      );
      if (fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
    }

    return res.json({ message: "ลบสถานที่สำเร็จ" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" });
  }
}
