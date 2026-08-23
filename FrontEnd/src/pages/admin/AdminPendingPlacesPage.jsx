import { useEffect, useState } from "react"; // โหลด Place pending เพื่อให้ Admin อนุมัติหรือปฏิเสธ | ปุ่มเรียก PATCH /api/places/:id/status
import PageHeader from "../../components/PageHeader.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, EmptyState } from "../../components/ui.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getErrorMessage } from "../../services/api.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function AdminPendingPlacesPage() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [places, setPlaces] = useState([]); // Array นี้มีเฉพาะ Place ที่ Backend คืนจาก /places/pending

  async function load() { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    try { // Token และ role ถูกตรวจโดย Middleware ก่อน Controller ส่งข้อมูล
      const response = await api.get("/places/pending"); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      setPlaces(response.data.places); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }
  useEffect(() => { load(); }, []); // เปิดหน้าครั้งแรกจึงโหลดรายการรออนุมัติ

  async function update(id, status) { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    try { // หลังเปลี่ยน status สำเร็จ โหลดรายการใหม่เพื่อให้รายการนั้นหายไป
      await api.patch(`/places/${id}/status`, { status }); // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      load();
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div><PageHeader title="อนุมัติคำขอเพิ่มสถานที่" subtitle="PLACES.status = pending" />
      {/* วน Place pending; ถ้าไม่มีให้แสดง EmptyState */}
      <section className="space-y-3 px-5 py-5">{places.length ? places.map((place) => (
        <article className="rounded-2xl bg-white p-4 shadow-sm" key={place.id}><div className="flex items-start justify-between"><div><h2 className="font-semibold">{place.name}</h2><p className="text-xs text-stone-500">ผู้ขอ: {place.createdBy?.name}</p><p className="mt-1 text-xs text-stone-400">GPS: {place.latitude}, {place.longitude}</p></div><span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-brand">pending</span></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="success" onClick={() => update(place.id, "active")}>อนุมัติ</Button><Button variant="danger" onClick={() => update(place.id, "rejected")}>ปฏิเสธ</Button></div></article>
      )) : <EmptyState title="ไม่มีคำขอรออนุมัติ" />}</section>
    </div>
  );
}
