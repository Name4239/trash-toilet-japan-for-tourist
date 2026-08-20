// แสดง Report, Place และ Reporter แบบละเอียด
// Admin เลือกปฏิเสธ Report หรือดำเนินการลบ Place
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { Button, PageLoader } from "../../components/ui.jsx";
import api, { getAssetUrl, getErrorMessage } from "../../services/api.js";

export default function AdminReportDetailPage() {
  // id จาก URL ใช้โหลด Report พร้อม Place และ Reporter
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  // โหลดรายละเอียดครั้งแรกหรือเมื่อ id ใน URL เปลี่ยน
  useEffect(() => {
    api.get(`/reports/${id}`)
      .then((response) => setReport(response.data.report))
      .catch((error) => console.error(getErrorMessage(error)));
  }, [id]);
  // ยังไม่มี Response ให้แสดง Loading
  if (!report) return <PageLoader />;

  async function update(status) {
    // ปุ่มปฏิเสธส่ง rejected; Backend จะลบรูปหลักฐานชั่วคราว
    try {
      await api.patch(`/reports/${id}/status`, { status });
      navigate("/admin/reports");
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  async function deleteReportedPlace() {
    // ใช้เมื่อหลักฐานยืนยันว่า Place ไม่มีจริงและต้องลบ Marker
    const confirmed = window.confirm(
      "ยืนยันลบสถานที่นี้? Marker และรายงานทั้งหมดของสถานที่จะถูกลบด้วย"
    );

    if (!confirmed) return;

    // Backend ตั้ง onDelete: Cascade จึงลบ Reports ของ Place นี้ตามไปด้วย
    try {
      await api.delete(`/places/${report.place.id}`);
      navigate("/admin/reports");
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  return (
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
