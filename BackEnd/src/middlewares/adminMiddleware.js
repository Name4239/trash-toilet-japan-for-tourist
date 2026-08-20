// ลำดับอ่าน 3B: ทำงานต่อจาก authMiddleware เฉพาะ Route ของ Admin
// ถ้า role ผ่าน next() จะพา request ไปยัง Controller ที่เขียนต่อท้ายใน Route
// ต้องเรียก authMiddleware ก่อน เพื่อให้ req.user มีข้อมูลผู้ใช้
export function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะ Admin เท่านั้น" });
  }

  // ถ้าเป็น Admin ให้ไปทำ Controller ตัวถัดไป
  next();
}
