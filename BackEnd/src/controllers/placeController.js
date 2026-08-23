import { prisma } from "../lib/prisma.js"; // ลำดับอ่าน 4C: placeRoutes และ Middleware ส่ง request มาที่ไฟล์นี้ | ฟังก์ชันในนี้ทำ Logic ของ Place แล้วใช้ prisma ติดต่อ Database | หลัง prisma ทำงาน ผลลัพธ์ถูกส่งกลับ Frontend ด้วย res.json(...) | นำ Prisma instance กลางมาใช้ติดต่อ Database
import fs from "fs"; // นำ fs มาใช้ตรวจและลบไฟล์รูปจริงในโฟลเดอร์ uploads
import path from "path"; // นำ path มาแปลง URL รูปให้เป็นตำแหน่งไฟล์บนเครื่อง Server
const placeTypes = ["toilet", "trash"]; // กำหนดประเภท Place ที่ Backend ยอมรับ เพื่อกันค่าที่ระบบไม่รู้จัก
const placeStatuses = ["pending", "active", "rejected", "inactive"]; // กำหนดสถานะ Place ที่ Backend ยอมรับสำหรับการค้นหาและอัปเดต
function calculateDistance(lat1, lng1, lat2, lng2) { // สูตรคำนวณระยะทางระหว่างพิกัดสองจุด ผลลัพธ์เป็นกิโลเมตร
  const earthRadius = 6371; // กำหนดรัศมีเฉลี่ยของโลกเป็นกิโลเมตร จึงได้ผลลัพธ์ระยะทางเป็น km
  const toRadians = (degree) => (degree * Math.PI) / 180; // สร้างฟังก์ชันแปลงองศาเป็นเรเดียน เพราะ Math.sin/Math.cos ใช้เรเดียน
  const latitudeDistance = toRadians(lat2 - lat1); // หาระยะต่างของละติจูดแล้วแปลงเป็นเรเดียน
  const longitudeDistance = toRadians(lng2 - lng1); // หาระยะต่างของลองจิจูดแล้วแปลงเป็นเรเดียน

  const value = // เริ่มคำนวณค่ากลางของสูตร Haversine จากความต่างของพิกัด
    Math.sin(latitudeDistance / 2) ** 2 + // ส่วนของความต่าง latitude ในสูตร
    Math.cos(toRadians(lat1)) * // ปรับค่าตาม latitude ของจุดเริ่มต้น
      Math.cos(toRadians(lat2)) * // ปรับค่าตาม latitude ของจุดปลายทาง
      Math.sin(longitudeDistance / 2) ** 2; // ส่วนของความต่าง longitude ในสูตร

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)); // แปลงค่ามุมจากสูตรเป็นระยะทางจริงหน่วยกิโลเมตรแล้วส่งกลับ
}
export async function getPlaces(req, res) { // GET /api/places ใช้แสดงสถานที่ active และใช้ค้นหาด้วย type/name
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const { type, search, status } = req.query; // อ่านตัวกรอง type, search และ status จาก Query string ของ URL

    if (type && !placeTypes.includes(type)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(400).json({ message: "type ต้องเป็น toilet หรือ trash" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    if (status && status !== "all" && !placeStatuses.includes(status)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(400).json({ message: "status ไม่ถูกต้อง" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    if (status === "all" && req.user?.role !== "admin") { // เฉพาะ Admin ที่ส่ง Token เท่านั้นจึงขอดูทุกสถานะพร้อมกันได้
      return res.status(403).json({ message: "เฉพาะ Admin ที่ดูสถานที่ทั้งหมดได้" }); // ตอบ 403 Forbidden เมื่อ Login แล้วแต่ไม่มีสิทธิ์ทำรายการนี้
    }

    const places = await prisma.place.findMany({ // ถ้าไม่ส่ง status มา จะคืนเฉพาะ active เพื่อให้หน้า Map ปลอดภัยตาม Logic
      where: { // กำหนดเงื่อนไขที่ Prisma ใช้ค้นหาแถวใน Database
        ...(status === "all" ? {} : { status: status || "active" }), // all ไม่กรองสถานะ; ค่าเริ่มต้นกรอง active
        ...(type ? { type } : {}), // มี type จึงเพิ่มเงื่อนไข toilet/trash
        ...(search ? { name: { contains: search } } : {}), // มี search จึงค้นคำที่อยู่ภายในชื่อ
      },
      orderBy: { createdAt: "desc" }, // กำหนดลำดับผลลัพธ์จาก Database ตามเวลาสร้าง
    });

    return res.json({ places }); // ส่งผลลัพธ์ JSON กลับ Postman หรือ Frontend แล้วจบ Controller
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}
export async function getNearbyPlaces(req, res) { // GET /api/places/nearby?latitude=...&longitude=...&radius=5
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const latitude = Number(req.query.latitude); // แปลง latitude จาก Query string เป็น Number
    const longitude = Number(req.query.longitude); // แปลง longitude จาก Query string เป็น Number
    const radius = Number(req.query.radius || 5); // แปลง radius เป็น Number และใช้ 5 กิโลเมตรเมื่อผู้ใช้ไม่ส่งค่า

    if ( // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      !Number.isFinite(latitude) || // latitude ต้องเป็นตัวเลขที่ใช้งานได้
      !Number.isFinite(longitude) || // longitude ต้องเป็นตัวเลขที่ใช้งานได้
      radius <= 0 // รัศมีต้องมากกว่า 0 กิโลเมตร
    ) {
      return res.status(400).json({ // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
        message: "กรุณาส่ง latitude, longitude และ radius ให้ถูกต้อง", // ข้อความที่ Postman/Frontend นำไปแสดง
      });
    }

    const activePlaces = await prisma.place.findMany({ // Marker ทุกตัวมาจาก Database และเลือกเฉพาะสถานที่ active
      where: { status: "active" }, // กำหนดเงื่อนไขที่ Prisma ใช้ค้นหาแถวใน Database
    });

    const places = activePlaces // คำนวณระยะทาง เพิ่ม distance แล้วกรองตามรัศมี
      .map((place) => ({ // วนทุก Place แล้วสร้าง Object ใหม่ที่เพิ่มค่า distance
        ...place,
        distance: calculateDistance( // เรียกสูตรคำนวณระยะทางจากตำแหน่งผู้ใช้ไปยัง Place นี้
          latitude, // latitude ของผู้ใช้หรือจุดค้นหา
          longitude, // longitude ของผู้ใช้หรือจุดค้นหา
          place.latitude, // latitude ของ Place จาก Database
          place.longitude // longitude ของ Place จาก Database
        ),
      }))
      .filter((place) => place.distance <= radius) // เก็บเฉพาะ Place ที่อยู่ไม่เกินรัศมีที่ผู้ใช้กำหนด
      .sort((a, b) => a.distance - b.distance); // เรียง Place จากใกล้ไปไกลตามค่า distance

    return res.json({ places }); // ส่งผลลัพธ์ JSON กลับ Postman หรือ Frontend แล้วจบ Controller
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}
export async function getPlaceById(req, res) { // GET /api/places/:id ใช้เปิดหน้า Place Detail
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const id = Number(req.params.id); // แปลง :id จาก URL ซึ่งเริ่มเป็น string ให้เป็นตัวเลขสำหรับ Prisma

    if (!Number.isInteger(id)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(400).json({ message: "Place id ไม่ถูกต้อง" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    const place = await prisma.place.findUnique({ where: { id } }); // ค้นหา Place หนึ่งรายการด้วย id ที่เป็น unique

    if (!place) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(404).json({ message: "ไม่พบสถานที่" }); // ตอบ 404 Not Found เมื่อค้นหา Place ตาม id แล้วไม่พบ
    }

    return res.json({ place }); // ส่งผลลัพธ์ JSON กลับ Postman หรือ Frontend แล้วจบ Controller
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}
export async function createPlace(req, res) { // POST /api/places ผู้ใช้ต้อง Login ก่อนจึงมาถึง Controller นี้
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const { name, type, address, latitude, longitude } = req.body; // อ่านข้อมูลสถานที่จาก Body ที่ Validation และ Multer ส่งต่อมา
    const parsedLatitude = Number(latitude); // แปลง latitude จาก multipart/form-data ซึ่งเป็น string ให้เป็น Number
    const parsedLongitude = Number(longitude); // แปลง longitude จาก multipart/form-data ซึ่งเป็น string ให้เป็น Number

    if (!name || !address || !placeTypes.includes(type)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res // ส่ง Response แล้วหยุด Controller // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
        .status(400) // 400 หมายถึงข้อมูลจาก Client ไม่ผ่านกฎ
        .json({ message: "กรุณากรอกชื่อ ประเภท และที่อยู่ให้ถูกต้อง" }); // ส่งสาเหตุเป็น JSON
    }

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(400).json({ message: "latitude และ longitude ต้องเป็นตัวเลข" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    if (!req.file) { // ทุกสถานที่ใหม่ต้องมีรูปจาก field image ของ multipart/form-data
      return res.status(400).json({ message: "กรุณาถ่ายหรือเลือกรูปสถานที่" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    const status = req.user.role === "admin" ? "active" : "pending"; // Backend เป็นผู้กำหนด status เอง เพื่อป้องกัน Member ส่ง active มาเอง

    const place = await prisma.place.create({ // สร้างแถว Place ใหม่ใน Database ด้วยข้อมูลที่เตรียมไว้
      data: { // กำหนดข้อมูลที่ Prisma จะสร้างหรืออัปเดตใน Database
        name, // ชื่อสถานที่จาก Body
        type, // ประเภท toilet หรือ trash ที่ Validation ตรวจแล้ว
        address, // ที่อยู่สำหรับแสดงในรายละเอียด
        imageUrl: `/uploads/${req.file.filename}`, // เก็บ URL สำหรับเปิดรูป แทนการเก็บ Binary file ลง Database
        latitude: parsedLatitude, // พิกัด latitude ที่แปลงเป็น Number แล้ว
        longitude: parsedLongitude, // พิกัด longitude ที่แปลงเป็น Number แล้ว
        status, // active สำหรับ Admin หรือ pending สำหรับ Member
        createdById: req.user.userId, // ผูก Place กับ id ของผู้ใช้ที่ผ่าน Token มาแล้ว
      },
    });

    return res.status(201).json({ message: "เพิ่มสถานที่สำเร็จ", place }); // ตอบ 201 Created พร้อม Place ที่เพิ่งบันทึกสำเร็จ
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}
export async function getPendingPlaces(req, res) { // GET /api/places/pending สำหรับหน้า Admin Pending Places
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const places = await prisma.place.findMany({ // อ่านรายการ Place หลายแถวจาก Database ด้วย Prisma
      where: { status: "pending" }, // กำหนดเงื่อนไขที่ Prisma ใช้ค้นหาแถวใน Database
      include: { // ขอข้อมูล Relation ที่เกี่ยวข้องกลับมาพร้อม Place
        createdBy: { select: { id: true, name: true, email: true } }, // แนบข้อมูลผู้ส่ง Place โดยไม่คืน password
      },
      orderBy: { createdAt: "asc" }, // กำหนดลำดับผลลัพธ์จาก Database ตามเวลาสร้าง
    });

    return res.json({ places }); // ส่งผลลัพธ์ JSON กลับ Postman หรือ Frontend แล้วจบ Controller
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}
export async function updatePlaceStatus(req, res) { // PATCH /api/places/:id/status สำหรับ Admin อนุมัติ ปฏิเสธ หรือปิดสถานที่
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const id = Number(req.params.id); // แปลง :id จาก URL ซึ่งเริ่มเป็น string ให้เป็นตัวเลขสำหรับ Prisma
    const { status } = req.body; // อ่านสถานะใหม่จาก Request Body

    if (!Number.isInteger(id) || !placeStatuses.includes(status)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(400).json({ message: "Place id หรือ status ไม่ถูกต้อง" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    const existingPlace = await prisma.place.findUnique({ where: { id } }); // ค้นหา Place หนึ่งรายการด้วย id ที่เป็น unique

    if (!existingPlace) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(404).json({ message: "ไม่พบสถานที่" }); // ตอบ 404 Not Found เมื่อค้นหา Place ตาม id แล้วไม่พบ
    }

    const place = await prisma.place.update({ // อัปเดตสถานะของ Place ที่พบใน Database
      where: { id }, // กำหนดเงื่อนไขที่ Prisma ใช้ค้นหาแถวใน Database
      data: { status }, // กำหนดข้อมูลที่ Prisma จะสร้างหรืออัปเดตใน Database
    });

    return res.json({ message: "เปลี่ยนสถานะสำเร็จ", place }); // ส่งผลลัพธ์ JSON กลับ Postman หรือ Frontend แล้วจบ Controller
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}
export async function deletePlace(req, res) { // DELETE /api/places/:id สำหรับ Admin เท่านั้น
  try { // เริ่มครอบงานที่อาจ Error เพื่อให้ส่ง Response 500 ได้อย่างควบคุม
    const id = Number(req.params.id); // แปลง :id จาก URL ซึ่งเริ่มเป็น string ให้เป็นตัวเลขสำหรับ Prisma

    if (!Number.isInteger(id)) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(400).json({ message: "Place id ไม่ถูกต้อง" }); // ตอบ 400 Bad Request เมื่อค่าที่ Client ส่งมาไม่ถูกต้อง
    }

    const existingPlace = await prisma.place.findUnique({ // ค้นหา Place หนึ่งรายการด้วย id ที่เป็น unique
      where: { id }, // กำหนดเงื่อนไขที่ Prisma ใช้ค้นหาแถวใน Database
      include: { reports: { select: { evidenceImageUrl: true } } }, // ขอข้อมูล Relation ที่เกี่ยวข้องกลับมาพร้อม Place
    });

    if (!existingPlace) { // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      return res.status(404).json({ message: "ไม่พบสถานที่" }); // ตอบ 404 Not Found เมื่อค้นหา Place ตาม id แล้วไม่พบ
    }

    await prisma.place.delete({ where: { id } }); // Schema ตั้ง onDelete: Cascade จึงลบ Reports ของสถานที่นี้ตามไปด้วย

    if (existingPlace.imageUrl) { // ลบไฟล์รูปของ Place ออกจาก uploads หลังลบข้อมูลสำเร็จ
      const imagePath = path.resolve(existingPlace.imageUrl.replace(/^\//, "")); // แปลง URL รูป Place เป็น Absolute path สำหรับลบไฟล์จริง
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
    }
    for (const report of existingPlace.reports) { // Place ถูกลบแล้ว Reports จะหายแบบ Cascade จึงลบรูปหลักฐานของ Reports ด้วย
      if (!report.evidenceImageUrl) continue; // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
      const evidencePath = path.resolve( // แปลง URL รูปหลักฐาน Report เป็น Absolute path สำหรับลบไฟล์จริง
        report.evidenceImageUrl.replace(/^\//, "") // ตัด / ด้านหน้าเพื่อแปลง URL เป็น path ในเครื่อง
      );
      if (fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath); // ตรวจเงื่อนไขนี้ก่อนทำงานต่อ และหยุดด้วย Response ที่กำหนดเมื่อข้อมูลไม่ผ่าน
    }

    return res.json({ message: "ลบสถานที่สำเร็จ" }); // ส่งผลลัพธ์ JSON กลับ Postman หรือ Frontend แล้วจบ Controller
  } catch (error) { // รับ Error ที่เกิดจาก Prisma หรือ Logic ภายใน try
    console.error(error); // พิมพ์ Error จริงใน Terminal เพื่อช่วยวิเคราะห์โดยไม่ส่งรายละเอียดลับให้ Client
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจาก Server" }); // ตอบ 500 โดยใช้ข้อความกลาง ไม่เปิดเผย Error ภายใน Server
  }
}