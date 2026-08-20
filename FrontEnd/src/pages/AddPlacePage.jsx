// รับข้อมูลจาก PlaceForm สร้าง FormData แล้ว POST /api/places
// Backend ตั้ง pending สำหรับ Member และ active สำหรับ Admin
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import PlaceForm from "../components/PlaceForm.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function AddPlacePage({ admin = false }) {
  // admin prop ทำให้ Page เดียวรองรับทั้ง Member และ Admin
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  async function handleSubmit(form) {
    // form มาจาก PlaceForm หลังตรวจว่ามีรูปแล้ว
    try {
      setMessage("");
      // รูปและข้อความต้องส่งเป็น FormData เพื่อให้ Multer อ่านไฟล์ได้
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("type", form.type);
      formData.append("address", form.address);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      formData.append("image", form.image);

      // Axios ตรวจพบ FormData และ Browser ใส่ multipart boundary ให้อัตโนมัติ
      const response = await api.post("/places", formData);
      setMessage(response.data.message);
      // Admin เพิ่มแล้วเป็น active จึงพาไปหน้า Map เพื่อเห็น Marker ทันที
      setTimeout(() => navigate("/"), 700);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader title={admin ? "เพิ่มสถานที่ใหม่" : "เพิ่มสถานที่ใหม่"} subtitle={admin ? "Admin เพิ่มแล้วแสดงบนแผนที่ทันที" : "ข้อมูลจะถูกส่งให้ผู้ดูแลตรวจสอบ"} />
      {/* PlaceForm ดูแล UI ส่วน Page นี้ดูแล API และ Navigation */}
      <section className="px-5 py-5"><PlaceForm onSubmit={handleSubmit} submitLabel={admin ? "เพิ่ม" : "ส่งข้อมูล"} />{message && <p className="mt-4 rounded-xl bg-white p-3 text-center text-sm">{message}</p>}</section>
    </div>
  );
}
