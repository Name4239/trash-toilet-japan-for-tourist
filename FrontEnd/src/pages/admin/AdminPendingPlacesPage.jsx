// โหลด Place pending เพื่อให้ Admin อนุมัติหรือปฏิเสธ
// ปุ่มเรียก PATCH /api/places/:id/status
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import { Button, EmptyState } from "../../components/ui.jsx";
import api, { getErrorMessage } from "../../services/api.js";

export default function AdminPendingPlacesPage() {
  // Array นี้มีเฉพาะ Place ที่ Backend คืนจาก /places/pending
  const [places, setPlaces] = useState([]);

  async function load() {
    // Token และ role ถูกตรวจโดย Middleware ก่อน Controller ส่งข้อมูล
    try {
      const response = await api.get("/places/pending");
      setPlaces(response.data.places);
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }
  // เปิดหน้าครั้งแรกจึงโหลดรายการรออนุมัติ
  useEffect(() => { load(); }, []);

  async function update(id, status) {
    // หลังเปลี่ยน status สำเร็จ โหลดรายการใหม่เพื่อให้รายการนั้นหายไป
    try {
      await api.patch(`/places/${id}/status`, { status });
      load();
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  return (
    <div><PageHeader title="อนุมัติคำขอเพิ่มสถานที่" subtitle="PLACES.status = pending" />
      {/* วน Place pending; ถ้าไม่มีให้แสดง EmptyState */}
      <section className="space-y-3 px-5 py-5">{places.length ? places.map((place) => (
        <article className="rounded-2xl bg-white p-4 shadow-sm" key={place.id}><div className="flex items-start justify-between"><div><h2 className="font-semibold">{place.name}</h2><p className="text-xs text-stone-500">ผู้ขอ: {place.createdBy?.name}</p><p className="mt-1 text-xs text-stone-400">GPS: {place.latitude}, {place.longitude}</p></div><span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-brand">pending</span></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="success" onClick={() => update(place.id, "active")}>อนุมัติ</Button><Button variant="danger" onClick={() => update(place.id, "rejected")}>ปฏิเสธ</Button></div></article>
      )) : <EmptyState title="ไม่มีคำขอรออนุมัติ" />}</section>
    </div>
  );
}
