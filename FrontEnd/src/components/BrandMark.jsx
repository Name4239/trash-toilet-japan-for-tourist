// แสดง Logo ใน Login/Register โดยอ่านรูปจาก public
// compact ลดขนาด Logo สำหรับหน้าสมัครสมาชิก
export default function BrandMark({ compact = false }) {
  return (
    <div className="text-center">
      {/* compact เปลี่ยนเฉพาะขนาด รูปต้นฉบับอยู่ใน public */}
      <img
        className={`mx-auto object-contain drop-shadow-lg ${compact ? "h-32 w-32" : "h-52 w-52"}`}
        src="/trash-toilet-logo.png"
        alt="Trash & Toilet Map"
      />
      {/* Login แสดงคำอธิบาย แต่ Register ซ่อนไว้เพื่อลดความสูง */}
      {!compact && <p className="auth-brand-text -mt-3 text-sm font-medium text-stone-600">เที่ยวญี่ปุ่นสบายใจ</p>}
    </div>
  );
}
