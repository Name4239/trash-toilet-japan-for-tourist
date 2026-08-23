import { Flag, Navigation, Share2, Trash2, Toilet } from "lucide-react";
// อ่าน Place id จาก URL แล้วเรียก GET /api/places/:id | แสดงรูป/ข้อมูล และส่งผู้ใช้ต่อไปหน้า Report ได้
import { useEffect, useState } from "react";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { useNavigate, useParams } from "react-router-dom";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../components/PageHeader.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, PageLoader } from "../components/ui.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getAssetUrl } from "../services/api.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function PlaceDetailPage() {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const { id } = useParams();
  // id มาจาก Route /places/:id และใช้เรียก Place รายการเดียว
  const navigate = useNavigate();
  // อ่านค่าจาก React Hook ที่ Component ต้องใช้ในรอบ render นี้
  const [place, setPlace] = useState(null);
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  useEffect(() => {
  // กำหนด Side effect ให้ทำงานเมื่อ Component render และ Dependency เปลี่ยน
    api.get(`/places/${id}`)
    // โหลดใหม่เมื่อ id เปลี่ยน; ถ้าไม่พบ Place ให้กลับหน้า Map
      .then((response) => setPlace(response.data.place))
      .catch(() => navigate("/"));
  }, [id, navigate]);
  if (!place) return <PageLoader />;
  // ระหว่าง API ยังไม่ตอบให้แสดง Spinner แทนข้อมูลว่าง
  const Icon = place.type === "toilet" ? Toilet : Trash2;
  // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

  async function share() {
  // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    const data = { title: place.name, text: place.address, url: window.location.href };
    // มือถือใช้ Web Share API; Desktop ที่ไม่รองรับจะ Copy URL แทน
    try {
    // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
      if (navigator.share) await navigator.share(data);
      // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      else {
        await navigator.clipboard.writeText(window.location.href);
        // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      }
    } catch (error) {
      if (error.name !== "AbortError") console.error(error);
      // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    }
  }

  return (
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
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
