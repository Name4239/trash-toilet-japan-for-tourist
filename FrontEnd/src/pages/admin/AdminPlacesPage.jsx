// Admin ดู Place ทุกสถานะและลบสถานที่
// API หน้านี้ต้องผ่าน authMiddleware และ adminMiddleware
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import PlaceCard from "../../components/PlaceCard.jsx";
import { Chip, EmptyState } from "../../components/ui.jsx";
import api, { getErrorMessage } from "../../services/api.js";

export default function AdminPlacesPage() {
  // เก็บข้อมูลทั้งหมดจาก Admin API และค่าที่ใช้ Filter บนหน้าจอ
  const [places, setPlaces] = useState([]);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  async function loadPlaces() {
    // status=all ใช้ได้เฉพาะ Admin และคืน Place ทุกสถานะ
    try {
      const response = await api.get("/places", { params: { status: "all" } });
      setPlaces(response.data.places);
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  // โหลดรายการครั้งเดียวเมื่อเปิดหน้า
  useEffect(() => { loadPlaces(); }, []);

  async function remove(id) {
    // ยืนยันก่อนลบ เพราะ Backend จะลบรูปและ Reports ที่เกี่ยวข้องด้วย
    if (!window.confirm("ยืนยันการลบสถานที่นี้?")) return;
    try {
      await api.delete(`/places/${id}`);
      loadPlaces();
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  }

  // Filter นี้ทำใน Browser เพราะโหลด Place ทั้งหมดมาแล้ว
  const filtered = places.filter((place) => (!type || place.type === type) && place.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div><PageHeader title="จัดการสถานที่" subtitle="เพิ่ม แก้สถานะ และลบสถานที่" />
      <section className="space-y-4 px-5 py-5"><input className="w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-brand" placeholder="ค้นหาสถานที่..." value={search} onChange={(e) => setSearch(e.target.value)} /><div className="flex gap-2"><Chip active={!type} onClick={() => setType("")}>ทั้งหมด</Chip><Chip active={type === "toilet"} onClick={() => setType("toilet")}>ห้องน้ำ</Chip><Chip active={type === "trash"} onClick={() => setType("trash")}>ถังขยะ</Chip></div>
        {/* ส่ง action เข้า PlaceCard เพื่อแทนปุ่มรายละเอียดด้วย status และปุ่มลบ */}
        <div className="space-y-3">{filtered.length ? filtered.map((place) => <PlaceCard key={place.id} place={place} action={<div className="flex items-center gap-2"><span className="text-xs text-stone-400">{place.status}</span><button className="rounded-lg bg-danger p-2 text-white" onClick={() => remove(place.id)}><Trash2 size={15} /></button></div>} />) : <EmptyState title="ไม่พบสถานที่" />}</div>
      </section>
    </div>
  );
}
