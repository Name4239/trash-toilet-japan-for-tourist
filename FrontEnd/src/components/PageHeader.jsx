import { ArrowLeft } from "lucide-react";
// หัวข้อที่ใช้ซ้ำ รองรับชื่อ คำอธิบาย และปุ่มย้อนกลับ | มีสีแยก Light/Dark เพื่อให้ทุกหน้าอ่านง่าย
import { useNavigate } from "react-router-dom";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function PageHeader({ title, subtitle, back = false }) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const navigate = useNavigate();
  // useNavigate ใช้สั่งย้อนกลับหนึ่งหน้าเมื่อกดลูกศร

  return (
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <header className="sticky top-0 z-[900] border-b border-cream-100 bg-cream-50/95 px-5 py-4 text-ink backdrop-blur dark:border-stone-700 dark:bg-[#25221f]/95 dark:text-[#f0e9df]">
      <div className="flex items-center gap-3">
        {/* สร้างปุ่มย้อนกลับเฉพาะหน้าที่ส่ง back=true */}
        {back && (
          <button aria-label="ย้อนกลับ" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {/* subtitle เป็นข้อมูลเสริม จึงไม่แสดงเมื่อ Page ไม่ได้ส่งมา */}
          {subtitle && <p className="text-xs text-stone-500 dark:text-[#cfc7bc]">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
