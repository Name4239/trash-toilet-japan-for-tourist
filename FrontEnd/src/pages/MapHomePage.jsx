// หน้าแรกหลัง Login: โหลด Place active แล้วส่งให้ PlaceMap วาด Marker
// react-geolocated อ่านตำแหน่งจริงเพื่อให้แผนที่ตามผู้ใช้
import { LoaderCircle, LocateFixed } from "lucide-react";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import PlaceMap from "../components/PlaceMap.jsx";
import { Chip } from "../components/ui.jsx";
import api from "../services/api.js";

export default function MapHomePage() {
  // places มาจาก Database ส่วน type คือ Filter ปัจจุบัน
  const [places, setPlaces] = useState([]);
  const [type, setType] = useState("");
  // Hook นี้ขอ GPS อัตโนมัติเมื่อเปิดหน้า และคืน coords/error
  const {
    coords,
    getPosition,
    positionError,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    suppressLocationOnMount: false,
    userDecisionTimeout: 12000,
  });

  useEffect(() => {
    // โหลด Place ใหม่ทุกครั้งที่ผู้ใช้เปลี่ยนประเภท
    api.get("/places", { params: type ? { type } : {} })
      .then((response) => setPlaces(response.data.places))
      .catch(() => {
        setPlaces([]);
      });
  }, [type]);

  // React Leaflet รับพิกัดในรูป Array [latitude, longitude]
  const position = coords ? [coords.latitude, coords.longitude] : null;

  return (
    <div className="relative h-[calc(100vh-4rem)] min-h-[620px] overflow-hidden md:h-[calc(100vh-7rem)]">
      <div className="absolute inset-0 bg-cream-100">
        {/* ยังไม่มี GPS จะแสดง Loading/Error แทนการสร้าง Map ด้วย center ว่าง */}
        {position ? (
          <PlaceMap places={places} position={position} />
        ) : (
          <div className="grid h-full place-items-center px-8 text-center text-stone-500">
            <div>
              {!positionError && (
                <LoaderCircle className="mx-auto mb-3 animate-spin text-brand" size={32} />
              )}
              <p className="font-semibold text-ink">
                {positionError ? "ไม่สามารถอ่านตำแหน่งได้" : "กำลังหาตำแหน่งของคุณ..."}
              </p>
              <p className="mt-1 text-sm">
                {positionError
                  ? "กรุณาเปิด GPS และอนุญาต Location แล้วลองอีกครั้ง"
                  : "แผนที่จะเปิดบริเวณใกล้คุณโดยอัตโนมัติ"}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* กล่อง Filter ลอยเหนือแผนที่ */}
      <div className="absolute inset-x-4 top-4 z-[800] rounded-2xl bg-white/95 p-3 text-ink shadow-lg backdrop-blur dark:bg-[#302d29]/95 dark:text-[#f0e9df]">
        <h1 className="text-center font-bold text-ink dark:text-[#f0e9df]">ค้นหาใกล้ฉัน</h1>
        <div className="mt-3 flex justify-center gap-2"><Chip active={!type} onClick={() => setType("")}>ทั้งหมด</Chip><Chip active={type === "toilet"} onClick={() => setType("toilet")}>ห้องน้ำ</Chip><Chip active={type === "trash"} onClick={() => setType("trash")}>ถังขยะ</Chip></div>
      </div>
      <button className="absolute bottom-5 left-1/2 z-[800] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-brand shadow-lg" onClick={getPosition}><LocateFixed size={19} />{position ? "ตำแหน่งปัจจุบัน" : "เปิด GPS"}</button>
      {(!isGeolocationAvailable || !isGeolocationEnabled) && <p className="absolute bottom-20 left-1/2 z-[800] w-72 -translate-x-1/2 rounded-xl bg-white p-2 text-center text-xs text-danger shadow">กรุณาเปิด GPS และอนุญาตตำแหน่ง</p>}
    </div>
  );
}
