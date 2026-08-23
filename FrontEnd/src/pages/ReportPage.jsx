import { Camera } from "lucide-react"; // รับ Place id จาก URL แล้วส่งเหตุผลไป POST /api/reports | Backend บังคับ Report ใหม่เป็น pending เพื่อรอ Admin
import { useEffect, useState } from "react"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { useNavigate, useParams } from "react-router-dom"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../components/PageHeader.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, Chip, Textarea } from "../components/ui.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getErrorMessage } from "../services/api.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function ReportPage() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const { id } = useParams(); // id มาจาก URL /places/:id/report และใช้เชื่อม Report กับ Place
  const navigate = useNavigate(); // อ่านค่าจาก React Hook ที่ Component ต้องใช้ในรอบ render นี้
  const [reason, setReason] = useState("wrong_info"); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [description, setDescription] = useState(""); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [error, setError] = useState(""); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [evidence, setEvidence] = useState(null); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [preview, setPreview] = useState(""); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]); // ลบ Preview URL ออกจากหน่วยความจำเมื่อเปลี่ยนรูปหรือปิดหน้า

  async function submit(event) { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    event.preventDefault(); // Report บังคับรูปหลักฐานก่อนสร้าง FormData
    try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
      if (!evidence) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
        setError("กรุณาแนบรูปหลักฐาน"); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
        return;
      }
      const formData = new FormData(); // ชื่อ field ต้องตรงกับ uploadReportEvidence และ createReportSchema
      formData.append("placeId", id);
      formData.append("reason", reason);
      formData.append("description", description);
      formData.append("evidence", evidence);
      await api.post("/reports", formData); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      navigate(`/places/${id}`); // เปลี่ยน URL และนำผู้ใช้ไปยังหน้าที่กำหนด
    } catch (requestError) {
      setError(getErrorMessage(requestError)); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    }
  }

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div><PageHeader title="รายงานข้อมูลผิด" back />
      <form className="space-y-5 px-5 py-6" onSubmit={submit}>
        {/* Chip เปลี่ยน reason แต่ไม่ Submit เพราะกำหนด type=button */}
        <div><span className="mb-2 block text-sm text-stone-600">ประเภทปัญหา</span><div className="flex flex-wrap gap-2"><Chip type="button" active={reason === "wrong_info"} onClick={() => setReason("wrong_info")}>ข้อมูลผิด</Chip><Chip type="button" active={reason === "not_exists"} onClick={() => setReason("not_exists")}>ไม่มีอยู่จริง</Chip><Chip type="button" active={reason === "closed"} onClick={() => setReason("closed")}>ปิดชั่วคราว</Chip><Chip type="button" active={reason === "other"} onClick={() => setReason("other")}>อื่น ๆ</Chip></div></div>
        <Textarea label="รายละเอียด" placeholder="อธิบายข้อมูลที่ถูกต้อง..." value={description} onChange={(e) => setDescription(e.target.value)} />
        {/* Preview แสดงเฉพาะใน Browser ส่วนไฟล์ evidence จะถูกส่งให้ Backend */}
        <label className="block">
          <span className="mb-2 block text-sm text-stone-600">รูปหลักฐานสำหรับ Admin</span>
          <span className="grid min-h-36 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-cream-200 bg-white">
            {preview ? <img className="h-48 w-full object-cover" src={preview} alt="รูปหลักฐาน" /> : <span className="flex items-center gap-2 text-sm text-brand"><Camera size={20} />ถ่ายหรือเลือกรูป</span>}
          </span>
          <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setEvidence(file); setPreview(URL.createObjectURL(file)); }} />
          <span className="mt-1 block text-xs text-stone-500">รูปจะถูกลบเมื่อ Admin จัดการรายงานเสร็จ</span>
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full">ส่งรายงาน</Button>
      </form>
    </div>
  );
}
