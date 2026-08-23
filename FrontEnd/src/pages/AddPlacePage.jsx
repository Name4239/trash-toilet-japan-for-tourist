import { useState } from "react";
// รับข้อมูลจาก PlaceForm สร้าง FormData แล้ว POST /api/places | Backend ตั้ง pending สำหรับ Member และ active สำหรับ Admin
import { useNavigate } from "react-router-dom";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../components/PageHeader.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PlaceForm from "../components/PlaceForm.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getErrorMessage } from "../services/api.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function AddPlacePage({ admin = false }) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const navigate = useNavigate();
  // admin prop ทำให้ Page เดียวรองรับทั้ง Member และ Admin
  const [message, setMessage] = useState("");
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  async function handleSubmit(form) {
  // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    try {
    // form มาจาก PlaceForm หลังตรวจว่ามีรูปแล้ว
      setMessage("");
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      const formData = new FormData();
      // รูปและข้อความต้องส่งเป็น FormData เพื่อให้ Multer อ่านไฟล์ได้
      formData.append("name", form.name);
      formData.append("type", form.type);
      formData.append("address", form.address);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      formData.append("image", form.image);

      const response = await api.post("/places", formData);
      // Axios ตรวจพบ FormData และ Browser ใส่ multipart boundary ให้อัตโนมัติ
      setMessage(response.data.message);
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setTimeout(() => navigate("/"), 700);
      // Admin เพิ่มแล้วเป็น active จึงพาไปหน้า Map เพื่อเห็น Marker ทันที
    } catch (error) {
      setMessage(getErrorMessage(error));
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    }
  }

  return (
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div>
      <PageHeader title={admin ? "เพิ่มสถานที่ใหม่" : "เพิ่มสถานที่ใหม่"} subtitle={admin ? "Admin เพิ่มแล้วแสดงบนแผนที่ทันที" : "ข้อมูลจะถูกส่งให้ผู้ดูแลตรวจสอบ"} />
      {/* PlaceForm ดูแล UI ส่วน Page นี้ดูแล API และ Navigation */}
      <section className="px-5 py-5"><PlaceForm onSubmit={handleSubmit} submitLabel={admin ? "เพิ่ม" : "ส่งข้อมูล"} />{message && <p className="mt-4 rounded-xl bg-white p-3 text-center text-sm">{message}</p>}</section>
    </div>
  );
}
