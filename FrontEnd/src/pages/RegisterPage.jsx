import { useState } from "react"; // ส่ง name/email/password ไป POST /api/auth/register | สมัครสำเร็จจะกลับ Login เพื่อเข้าสู่ระบบ
import { Link, useNavigate } from "react-router-dom"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import BrandMark from "../components/BrandMark.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, Field } from "../components/ui.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getErrorMessage } from "../services/api.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function RegisterPage() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const navigate = useNavigate(); // form เก็บข้อมูลสี่ช่อง ส่วน Backend รับเฉพาะ name/email/password
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" }); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [error, setError] = useState(""); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [submitting, setSubmitting] = useState(false); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  async function handleSubmit(event) { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    event.preventDefault(); // ตรวจยืนยันรหัสผ่านที่ Frontend ก่อน เพราะ Backend ไม่มี confirmPassword
    if (form.password !== form.confirmPassword) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      setError("รหัสผ่านไม่ตรงกัน"); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      return;
    }

    setSubmitting(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setError(""); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
      await api.post("/auth/register", { name: form.name, email: form.email, password: form.password }); // ส่ง JSON ไป Register API แล้วนำไปหน้า Login เมื่อสำเร็จ
      navigate("/login", { state: { message: "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ" } }); // เปลี่ยน URL และนำผู้ใช้ไปยังหน้าที่กำหนด
    } catch (requestError) {
      setError(getErrorMessage(requestError)); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    } finally {
      setSubmitting(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    }
  }

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-cream-50 px-5 py-6 shadow-2xl">
      <div className="absolute inset-0 bg-[url('/auth-background.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-white/15" />
      <div className="relative"><BrandMark compact /></div>
      <div className="auth-panel relative -mt-2 rounded-3xl bg-cream-50/88 p-5 shadow-lg backdrop-blur-[2px]">
      <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
      <p className="text-sm text-stone-500">สร้างบัญชีเพื่อร่วมแบ่งปันสถานที่</p>
      {/* ทุก Field อัปเดตค่าของตัวเองเข้า form State */}
      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <Field label="ชื่อผู้ใช้" placeholder="กรอกชื่อผู้ใช้" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field label="อีเมล" type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Field label="ยืนยันรหัสผ่าน" type="password" placeholder="กรอกรหัสผ่านอีกครั้ง" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</p>}
        <Button className="w-full" disabled={submitting}>{submitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-stone-500">มีบัญชีแล้ว? <Link className="font-semibold text-brand" to="/login">เข้าสู่ระบบ</Link></p>
      </div>
    </div>
  );
}
