// รับ Place id จาก URL แล้วส่งเหตุผลไป POST /api/reports
// Backend บังคับ Report ใหม่เป็น pending เพื่อรอ Admin
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { Button, Chip, Textarea } from "../components/ui.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function ReportPage() {
  // id มาจาก URL /places/:id/report และใช้เชื่อม Report กับ Place
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("wrong_info");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [preview, setPreview] = useState("");

  // ลบ Preview URL ออกจากหน่วยความจำเมื่อเปลี่ยนรูปหรือปิดหน้า
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function submit(event) {
    // Report บังคับรูปหลักฐานก่อนสร้าง FormData
    event.preventDefault();
    try {
      if (!evidence) {
        setError("กรุณาแนบรูปหลักฐาน");
        return;
      }
      // ชื่อ field ต้องตรงกับ uploadReportEvidence และ createReportSchema
      const formData = new FormData();
      formData.append("placeId", id);
      formData.append("reason", reason);
      formData.append("description", description);
      formData.append("evidence", evidence);
      await api.post("/reports", formData);
      navigate(`/places/${id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
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
