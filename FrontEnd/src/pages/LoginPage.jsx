// ลำดับอ่าน Page 1: รับ email/password แล้วเรียก AuthProvider
// สำเร็จแล้ว Member ไป Map ส่วน Admin ไปหน้าจัดการ
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import { Button, Field } from "../components/ui.jsx";
import useAuth from "../hooks/useAuth.js";
import { getErrorMessage } from "../services/api.js";

export default function LoginPage() {
  // AuthProvider ทำงาน Login ส่วน Page นี้ดูแล Form และการเปลี่ยนหน้า
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ถ้า Login อยู่แล้วไม่ควรเห็นหน้านี้ จึงส่งไปหน้าตาม role ทันที
  if (user) return <Navigate to={user.role === "admin" ? "/admin/places" : "/"} replace />;

  async function handleSubmit(event) {
    // ปิดการ Submit แบบ HTML แล้วเรียก API ผ่าน login() แทน
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // login คืน User ทำให้รู้ว่าควรพาไปหน้า Member หรือ Admin
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser?.role === "admin" ? "/admin/places" : "/");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-cream-50 px-5 py-8 shadow-2xl">
      <div className="absolute inset-0 bg-[url('/auth-background.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-white/15" />
      <div className="relative"><BrandMark /></div>
      <div className="auth-panel relative mt-3 rounded-3xl bg-cream-50/88 p-5 shadow-lg backdrop-blur-[2px]">
        <h2 className="text-2xl font-bold">ยินดีต้อนรับ</h2>
        <p className="text-sm text-stone-500">เข้าสู่ระบบก่อนเริ่มค้นหาสถานที่</p>
        {/* Form นี้เป็น Controlled Form ค่าอยู่ใน form State */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Field label="อีเมล" type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</p>}
          <Button className="w-full" disabled={submitting}>{submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-500">ยังไม่มีบัญชี? <Link className="font-semibold text-brand" to="/register">สมัครสมาชิก</Link></p>
      </div>
    </div>
  );
}
