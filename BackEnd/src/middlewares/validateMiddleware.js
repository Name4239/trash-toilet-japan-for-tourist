import fs from "fs";
// ลำดับอ่าน 3C: Route เรียกไฟล์นี้หลัง Auth/Upload และก่อน Controller | Zod ตรวจรูปร่าง/ชนิดข้อมูล ถ้าผ่านจึง next() ไป Controller

export function validate(schema, target = "body") {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return (req, res, next) => {
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    const result = schema.safeParse(req[target]);
    // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

    if (!result.success) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      if (req.file?.path && fs.existsSync(req.file.path)) {
      // ถ้าอัปโหลดรูปมาแล้วแต่ข้อมูลอื่นไม่ผ่าน ให้ลบไฟล์ที่เพิ่งอัปโหลด
        fs.unlinkSync(req.file.path);
      }

      const errors = result.error.issues.map((issue) => ({
      // แปลง Zod issues ให้เป็นข้อความสั้น ๆ ที่ Frontend นำไปแสดงได้
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
      // ส่ง HTTP status และ JSON กลับ Client พร้อมหยุด Controller
        message: "ข้อมูลไม่ถูกต้อง",
        errors,
      });
    }

    if (target === "body") {
    // body แก้ค่าได้ จึงใช้ค่าที่ Zod trim/coerce เรียบร้อยแล้วต่อใน Controller
      req.body = result.data;
    }

    req.validated = req.validated || {};
    // เก็บค่าที่ผ่าน Validation ไว้ด้วย เผื่อ Controller ต้องการใช้ภายหลัง
    req.validated[target] = result.data;
    next();
  };
}
