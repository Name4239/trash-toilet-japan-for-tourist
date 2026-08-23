import { ChevronRight } from "lucide-react"; // โหลดเฉพาะ Report pending แล้วแสดงรายการให้ Admin ตรวจ | กดรายการแล้วเปิด AdminReportDetailPage ตาม id
import { useEffect, useState } from "react"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Link } from "react-router-dom"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../../components/PageHeader.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { EmptyState } from "../../components/ui.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api from "../../services/api.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function AdminReportsPage() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [reports, setReports] = useState([]); // reports เก็บงาน pending ที่ Admin ยังไม่ได้ตัดสินใจ
  useEffect(() => { // หน้าแจ้งเตือนแสดงเฉพาะงานที่ยังรอดำเนินการ | เมื่อ resolved/rejected แล้ว รายการจะหายจากหน้านี้
    api
      .get("/reports", { params: { status: "pending" } })
      .then((response) => setReports(response.data.reports))
      .catch(() => setReports([]));
  }, []);

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div><PageHeader title="ตรวจรายงานข้อมูลผิด" subtitle="จัดการรายงานจากผู้ใช้งาน" />
      {/* Link แต่ละรายการส่ง report.id ไปหน้ารายละเอียด */}
      <section className="space-y-3 px-5 py-5">{reports.length ? reports.map((report) => (
        <Link className="flex items-center rounded-2xl bg-white p-4 shadow-sm" to={`/admin/reports/${report.id}`} key={report.id}><div className="min-w-0 flex-1"><p className="text-xs font-bold text-danger">REPORT #{String(report.id).padStart(4, "0")}</p><h2 className="mt-1 truncate font-semibold">{report.place?.name}</h2><p className="text-xs text-stone-500">{report.reason}</p></div><span className={`mr-3 rounded-full px-3 py-1 text-xs ${report.status === "pending" ? "bg-orange-100 text-brand" : "bg-green-100 text-leaf"}`}>{report.status}</span><ChevronRight size={18} /></Link>
      )) : <EmptyState title="ยังไม่มีรายงาน" />}</section>
    </div>
  );
}
