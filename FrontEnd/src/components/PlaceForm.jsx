import { Camera, LocateFixed } from "lucide-react";
// ฟอร์มเพิ่ม Place ที่ Member และ Admin ใช้ร่วมกัน | รับรูป GPS ที่อยู่ แล้วส่งข้อมูลกลับ AddPlacePage ผ่าน onSubmit
import { useEffect, useState } from "react";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { useGeolocated } from "react-geolocated";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, Chip, Field, Textarea } from "./ui.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PlaceMap from "./PlaceMap.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { reverseGeocode } from "../services/locationService.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function PlaceForm({ onSubmit, submitLabel = "เพิ่มสถานที่" }) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [form, setForm] = useState({ name: "", address: "", type: "toilet", description: "", latitude: "", longitude: "" });
  // form เก็บค่าข้อความ/พิกัดทั้งหมดที่ผู้ใช้กรอก

  const [image, setImage] = useState(null);
  // กลุ่ม State ของรูป: ไฟล์จริงใช้ส่ง API ส่วน Preview ใช้แสดงบนหน้าจอ
  const [imagePreview, setImagePreview] = useState("");
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [imageError, setImageError] = useState("");
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [addressLoading, setAddressLoading] = useState(false);
  // กลุ่ม State ของ GPS และการค้นหาที่อยู่
  const [locationError, setLocationError] = useState("");
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const { coords, getPosition, isGeolocationEnabled } = useGeolocated({ positionOptions: { enableHighAccuracy: true }, userDecisionTimeout: 10000, suppressLocationOnMount: true });
  // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

  useEffect(() => {
  // Effect นี้ทำงานหลัง react-geolocated ส่ง coords ค่าใหม่กลับมา
    if (!coords) return;
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน

    const controller = new AbortController();
    // AbortController ยกเลิก Request เก่าเมื่อ Component ปิดหรือพิกัดเปลี่ยน
    setAddressLoading(true);
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setLocationError("");
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด

    setForm((current) => ({
    // ใส่พิกัดทันที แล้วค่อยเติมที่อยู่เมื่อ Nominatim ตอบกลับ
      ...current,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));

    reverseGeocode(coords.latitude, coords.longitude, controller.signal)
    // ส่งพิกัดไปแปลงเป็นข้อความที่อยู่ แล้วเติมกลับเข้า form
      .then((address) => {
        setForm((current) => ({ ...current, address }));
        // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
        // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
          setLocationError("ได้พิกัดแล้ว แต่ค้นหาที่อยู่ไม่สำเร็จ กรุณากรอกเอง");
          // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
        }
      })
      .finally(() => setAddressLoading(false));

    return () => controller.abort();
    // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
  }, [coords]);

  function requestCurrentPosition() {
  // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    getPosition();
    // เปิดคำขอ GPS ของ Browser; coords จะอัปเดตภายหลังแบบ asynchronous
    if (coords) setForm((current) => ({ ...current, latitude: coords.latitude, longitude: coords.longitude }));
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
  }

  function applyCoordinates() {
  // react-geolocated อัปเดต coords หลังผู้ใช้อนุญาต จึงมีปุ่มอีกครั้งเพื่อใส่ค่าล่าสุด
    requestCurrentPosition();
    // ขอพิกัดใหม่ทุกครั้งที่กด เผื่อผู้ใช้เคลื่อนที่จากตำแหน่งเดิม

    if (coords) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      setForm((current) => ({ ...current, latitude: coords.latitude, longitude: coords.longitude }));
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    }
  }

  function chooseImage(event) {
  // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    const selectedImage = event.target.files?.[0];
    // อ่านไฟล์แรกจาก input และสร้าง URL ชั่วคราวสำหรับ Preview
    if (!selectedImage) return;
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน

    setImage(selectedImage);
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setImagePreview(URL.createObjectURL(selectedImage));
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setImageError("");
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
  }

  function handleSubmit(event) {
  // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    event.preventDefault();
    // ป้องกัน Browser reload หน้าเมื่อกด Submit

    if (!image) {
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      setImageError("กรุณาถ่ายหรือเลือกรูปสถานที่");
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      return;
    }

    onSubmit({ ...form, image });
    // ส่งข้อมูลกลับ Parent (AddPlacePage) ซึ่งเป็นผู้สร้าง FormData และเรียก API
  }

  return (
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* ส่วน Map/GPS ใช้เลือกพิกัดปัจจุบัน */}
      <div className="relative h-44 overflow-hidden rounded-2xl bg-cream-100 text-center">
        {coords && (
          <PlaceMap
            places={[]}
            position={[coords.latitude, coords.longitude]}
          />
        )}
        <button
          type="button"
          className="absolute bottom-3 left-1/2 z-[800] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand shadow-lg"
          onClick={applyCoordinates}
        >
          <LocateFixed size={17} />
          {addressLoading ? "กำลังค้นหาที่อยู่..." : coords ? "ตำแหน่งปัจจุบัน" : "ค้นหาตำแหน่งปัจจุบัน"}
        </button>
      </div>
      {!isGeolocationEnabled && <p className="text-sm text-danger">อุปกรณ์นี้ปิดการใช้งาน GPS</p>}
      {locationError && <p className="text-sm text-danger">{locationError}</p>}
      {/* ส่วนเลือกรูปบังคับก่อนส่ง และ capture=environment แนะนำกล้องหลังบนมือถือ */}
      <div>
        <span className="mb-2 block text-sm text-stone-600">รูปสถานที่</span>
        <label className="relative grid min-h-40 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-orange-200 bg-white text-center text-brand">
          {imagePreview ? (
            <img className="h-48 w-full object-cover" src={imagePreview} alt="ตัวอย่างรูปสถานที่" />
          ) : (
            <span><Camera className="mx-auto" size={28} /><span className="mt-2 block text-sm font-semibold">ถ่ายรูปหรือเลือกรูป</span><span className="mt-1 block text-xs text-stone-400">รองรับรูปไม่เกิน 5 MB</span></span>
          )}
          <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={chooseImage} />
        </label>
        {imageError && <p className="mt-1 text-sm text-danger">{imageError}</p>}
      </div>
      {/* ช่องข้อมูลด้านล่างเป็น Controlled Input ทุกการพิมพ์จะอัปเดต form State */}
      <Field label="ชื่อสถานที่" placeholder="กรอกชื่อสถานที่" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div><span className="mb-2 block text-sm text-stone-600">ประเภท</span><div className="flex gap-2"><Chip type="button" active={form.type === "toilet"} onClick={() => setForm({ ...form, type: "toilet" })}>ห้องน้ำ</Chip><Chip type="button" active={form.type === "trash"} onClick={() => setForm({ ...form, type: "trash" })}>ถังขยะ</Chip></div></div>
      <Field label="ที่อยู่" placeholder="กรอกที่อยู่" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <div className="grid grid-cols-2 gap-3"><Field label="Latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /><Field label="Longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
      <Textarea label="รายละเอียด (ไม่บังคับ)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Button className="w-full">{submitLabel}</Button>
    </form>
  );
}
