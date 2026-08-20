// ลำดับอ่าน 3C: Route เรียกไฟล์นี้หลัง Auth/Upload และก่อน Controller
// Zod ตรวจรูปร่าง/ชนิดข้อมูล ถ้าผ่านจึง next() ไป Controller
import fs from "fs";

export function validate(schema, target = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // ถ้าอัปโหลดรูปมาแล้วแต่ข้อมูลอื่นไม่ผ่าน ให้ลบไฟล์ที่เพิ่งอัปโหลด
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      // แปลง Zod issues ให้เป็นข้อความสั้น ๆ ที่ Frontend นำไปแสดงได้
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        message: "ข้อมูลไม่ถูกต้อง",
        errors,
      });
    }

    // body แก้ค่าได้ จึงใช้ค่าที่ Zod trim/coerce เรียบร้อยแล้วต่อใน Controller
    if (target === "body") {
      req.body = result.data;
    }

    // เก็บค่าที่ผ่าน Validation ไว้ด้วย เผื่อ Controller ต้องการใช้ภายหลัง
    req.validated = req.validated || {};
    req.validated[target] = result.data;
    next();
  };
}
