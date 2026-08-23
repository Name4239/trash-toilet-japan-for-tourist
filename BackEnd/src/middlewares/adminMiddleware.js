export function adminMiddleware(req, res, next) { // ลำดับอ่าน 3B: ทำงานต่อจาก authMiddleware เฉพาะ Route ของ Admin | ถ้า role ผ่าน next() จะพา request ไปยัง Controller ที่เขียนต่อท้ายใน Route | ต้องเรียก authMiddleware ก่อน เพื่อให้ req.user มีข้อมูลผู้ใช้
  if (req.user.role !== "admin") { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    return res.status(403).json({ message: "เฉพาะ Admin เท่านั้น" }); // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
  }

  next(); // ถ้าเป็น Admin ให้ไปทำ Controller ตัวถัดไป
}
