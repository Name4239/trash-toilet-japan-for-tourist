import { useEffect, useState } from "react";
// แสดง Report, Place และ Reporter แบบละเอียด | Admin เลือกปฏิเสธ Report หรือดำเนินการลบ Place
import { useNavigate, useParams } from "react-router-dom";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../../components/PageHeader.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, PageLoader } from "../../components/ui.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getAssetUrl, getErrorMessage } from "../../services/api.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function AdminReportDetailPage() {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const { id } = useParams();
  // id จาก URL ใช้โหลด Report พร้อม Place และ Reporter
  const navigate = useNavigate();
  // อ่านค่าจาก React Hook ที่ Component ต้องใช้ในรอบ render นี้
  const [report, setReport] = useState(null);
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
  // โหลดรายละเอียดครั้งแรกหรือเมื่อ id ใน URL เปลี่ยน
    api.get(`/reports/${id}`)
      .then((response) => setReport(response.data.report))
      .catch((error) => console.error(getErrorMessage(error)));
  }, [id]);
  if (!report) return <PageLoader />;
  // ยังไม่มี Response ให้แสดง Loading

  async function update(status) {
  // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    try {
    // ปุ่มปฏิเสธส่ง rejected; Backend จะลบรูปหลักฐานชั่วคราว
      await api.patch(`/reports/${id}/status`, { status });
      // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      navigate("/admin/reports");
      // เปลี่ยน URL และนำผู้ใช้ไปยังหน้าที่กำหนด
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  async function deleteReportedPlace() {
  // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    const confirmed = window.confirm(
    // ใช้เมื่อหลักฐานยืนยันว่า Place ไม่มีจริงและต้องลบ Marker
      "ยืนยันลบสถานที่นี้? Marker และรายงานทั้งหมดของสถานที่จะถูกลบด้วย"
    );

    if (!confirmed) return;
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน

    try {
    // Backend ตั้ง onDelete: Cascade จึงลบ Reports ของ Place นี้ตามไปด้วย
      await api.delete(`/places/${report.place.id}`);
      // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      navigate("/admin/reports");
      // เปลี่ยน URL และนำผู้ใช้ไปยังหน้าที่กำหนด
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  return (
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div><PageHeader title="รายละเอียดรายงาน" back />
      {/* รูปบนสุดคือรูปประจำ Place ไม่ใช่รูปหลักฐาน */}
      <div className="h-48 overflow-hidden bg-green-100">{report.place.imageUrl && <img className="h-full w-full object-cover" src={getAssetUrl(report.place.imageUrl)} alt={report.place.name} />}</div>
      <section className="px-5 py-5"><p className="text-xs font-bold text-danger">REPORT #{String(report.id).padStart(4, "0")}</p><h1 className="mt-2 text-2xl font-bold">{report.place.name}</h1><p className="text-sm text-stone-500">{report.place.address}</p><div className="mt-6 rounded-2xl bg-white p-4"><p className="text-sm font-semibold">เหตุผล: {report.reason}</p><p className="mt-2 text-sm leading-6 text-stone-600">{report.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p><p className="mt-4 text-xs text-stone-400">รายงานโดย {report.reporter.name} · {report.reporter.email}</p></div>
        {/* evidenceImageUrl คือรูปชั่วคราวที่ผู้รายงานแนบให้ Admin ตรวจ */}
        {report.evidenceImageUrl && <div className="mt-4"><p className="mb-2 text-sm font-semibold">รูปหลักฐานจากผู้รายงาน</p><img className="max-h-80 w-full rounded-2xl object-cover" src={getAssetUrl(report.evidenceImageUrl)} alt="รูปหลักฐานรายงาน" /></div>}
        {report.status === "pending" ? <div className="mt-8 grid grid-cols-2 gap-3"><Button variant="success" onClick={deleteReportedPlace}>ดำเนินการลบ</Button><Button variant="danger" onClick={() => update("rejected")}>ปฏิเสธรายงาน</Button></div> : <p className="mt-8 rounded-xl bg-green-50 p-4 text-center font-semibold text-leaf">รายงานนี้: {report.status}</p>}
      </section>
    </div>
  );
}
