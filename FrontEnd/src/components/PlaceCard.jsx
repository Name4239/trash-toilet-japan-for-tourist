// รับ Place จาก SearchPage แล้วแสดงรูป ชื่อ ที่อยู่ และระยะ
// ปุ่มรายละเอียดส่งไป /places/:id
import { MapPin, Trash2, Toilet } from "lucide-react";
import { Link } from "react-router-dom";
import { getAssetUrl } from "../services/api.js";

export default function PlaceCard({ place, action }) {
  // เลือก Icon สำรองตามประเภท กรณี Place ไม่มีรูปภาพ
  const Icon = place.type === "toilet" ? Toilet : Trash2;
  return (
    <article className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
      {/* ถ้ามี imageUrl ให้แสดงรูปจริง ถ้าไม่มีจึงแสดง Icon */}
      <div className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl ${place.type === "toilet" ? "bg-green-100 text-leaf" : "bg-orange-100 text-brand"}`}>{place.imageUrl ? <img className="h-full w-full object-cover" src={getAssetUrl(place.imageUrl)} alt={place.name} /> : <Icon size={28} />}</div>
      {/* action เปิดให้หน้า Admin ส่งปุ่มของตัวเองมาแทนปุ่มรายละเอียดปกติ */}
      <div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{place.name}</h3><p className="mt-1 flex items-center gap-1 truncate text-xs text-stone-500"><MapPin size={13} />{place.address}</p><div className="mt-2 flex items-center justify-between"><span className="text-xs text-stone-400">{place.distance != null ? `${place.distance.toFixed(2)} km` : place.type}</span>{action || <Link className="rounded-full bg-leaf px-3 py-1 text-xs text-white" to={`/places/${place.id}`}>รายละเอียด</Link>}</div></div>
    </article>
  );
}
