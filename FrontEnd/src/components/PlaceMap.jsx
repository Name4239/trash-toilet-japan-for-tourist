// รับ places จาก MapHomePage แล้ววาด Base Map, Marker และตำแหน่งผู้ใช้
// OpenStreetMap เป็นพื้นแผนที่ ส่วน Marker มาจาก Backend/Database
import L from "leaflet";
import { Trash2, Toilet } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { createRoot } from "react-dom/client";
import { Link } from "react-router-dom";
import { getAssetUrl } from "../services/api.js";

function RecenterMap({ center }) {
  // useMap เข้าถึง Leaflet Map ที่ถูกสร้างโดย MapContainer
  const map = useMap();
  // เปลี่ยนจุดกึ่งกลาง แต่รักษาระดับ Zoom ปัจจุบันไว้
  map.setView(center, map.getZoom());
  return null;
}

function markerIcon(type) {
  // ห้องน้ำใช้สีน้ำเงิน ถังขยะใช้สีส้ม
  const color = type === "toilet" ? "#3f7ee8" : "#ff8518";
  const Icon = type === "toilet" ? Toilet : Trash2;
  const iconElement = document.createElement("div");
  iconElement.style.cssText = `display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:${color};border:3px solid white;box-shadow:0 4px 12px rgba(63,56,47,.28)`;
  createRoot(iconElement).render(<Icon color="white" size={23} strokeWidth={2.5} />);

  // แปลง HTML ที่สร้างเป็น Leaflet divIcon สำหรับ Marker
  return L.divIcon({
    className: "",
    html: iconElement,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

// จุดสีเขียวนี้แทนตำแหน่ง GPS ของผู้ใช้ ไม่ใช่ Place จาก Database
const userIcon = L.divIcon({ className: "", html: '<div class="map-dot" style="width:18px;height:18px;background:#4faf6a"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });

export default function PlaceMap({ places, position }) {
  return (
    <MapContainer center={position} zoom={14} zoomControl={false}>
      {/* TileLayer คือภาพพื้นแผนที่จาก OpenStreetMap */}
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* เมื่อมี GPS ให้เลื่อน Map และวาด Marker ของผู้ใช้ */}
      {position && <><RecenterMap center={position} /><Marker position={position} icon={userIcon}><Popup>ตำแหน่งของคุณ</Popup></Marker></>}
      {/* Marker ส่วนนี้สร้างจาก places ที่ Backend ส่งมา */}
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon(place.type)}>
          <Popup><div className="min-w-40">{place.imageUrl && <img className="mb-2 h-20 w-full rounded-lg object-cover" src={getAssetUrl(place.imageUrl)} alt={place.name} />}<strong>{place.name}</strong><p>{place.type === "toilet" ? "ห้องน้ำ" : "ถังขยะ"}</p><p>{place.address}</p><Link className="font-semibold text-orange-600" to={`/places/${place.id}`}>ดูรายละเอียด</Link></div></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
