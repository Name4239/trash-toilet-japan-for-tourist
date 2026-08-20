// อ่าน Place id จาก URL แล้วเรียก GET /api/places/:id
// แสดงรูป/ข้อมูล และส่งผู้ใช้ต่อไปหน้า Report ได้
import { Flag, Navigation, Share2, Trash2, Toilet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { Button, PageLoader } from "../components/ui.jsx";
import api, { getAssetUrl } from "../services/api.js";

export default function PlaceDetailPage() {
  // id มาจาก Route /places/:id และใช้เรียก Place รายการเดียว
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    // โหลดใหม่เมื่อ id เปลี่ยน; ถ้าไม่พบ Place ให้กลับหน้า Map
    api.get(`/places/${id}`)
      .then((response) => setPlace(response.data.place))
      .catch(() => navigate("/"));
  }, [id, navigate]);
  // ระหว่าง API ยังไม่ตอบให้แสดง Spinner แทนข้อมูลว่าง
  if (!place) return <PageLoader />;
  const Icon = place.type === "toilet" ? Toilet : Trash2;

  async function share() {
    // มือถือใช้ Web Share API; Desktop ที่ไม่รองรับจะ Copy URL แทน
    const data = { title: place.name, text: place.address, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      if (error.name !== "AbortError") console.error(error);
    }
  }

  return (
    <div><PageHeader title="รายละเอียดสถานที่" back />
      {/* แสดงรูปจริงจาก uploads หรือ Icon สำรองเมื่อไม่มีรูป */}
      <div className={`grid h-52 place-items-center overflow-hidden ${place.type === "toilet" ? "bg-green-100 text-leaf" : "bg-orange-100 text-brand"}`}>{place.imageUrl ? <img className="h-full w-full object-cover" src={getAssetUrl(place.imageUrl)} alt={place.name} /> : <Icon size={72} />}</div>
      <section className="px-5 py-5"><span className="rounded-full bg-white px-3 py-1 text-xs">{place.type === "toilet" ? "ห้องน้ำ" : "ถังขยะ"}</span><h1 className="mt-3 text-2xl font-bold">{place.name}</h1><p className="mt-2 text-sm text-stone-500">{place.address}</p><p className="mt-5 text-sm leading-7 text-stone-600">สถานที่นี้ได้รับการอนุมัติและแสดงจากฐานข้อมูล Trash & Toilet Map</p>
        {/* ปุ่มนำทางส่งเฉพาะพิกัดปลายทางไป Google Maps ไม่ได้ใช้เป็น Base Map */}
        <div className="mt-8 grid grid-cols-2 gap-3"><Button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`, "_blank")}><Navigation size={18} />นำทาง</Button><Button variant="outline" onClick={share}><Share2 size={18} />แชร์</Button></div>
        <Button className="mt-3 w-full" variant="ghost" onClick={() => navigate(`/places/${id}/report`)}><Flag size={18} />รายงานข้อมูลผิด</Button>
      </section>
    </div>
  );
}
