// ส่ง name/email/password ไป POST /api/auth/register
// สมัครสำเร็จจะกลับ Login เพื่อเข้าสู่ระบบ
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import { Button, Field } from "../components/ui.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function RegisterPage() {
  // form เก็บข้อมูลสี่ช่อง ส่วน Backend รับเฉพาะ name/email/password
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    // ตรวจยืนยันรหัสผ่านที่ Frontend ก่อน เพราะ Backend ไม่มี confirmPassword
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      // ส่ง JSON ไป Register API แล้วนำไปหน้า Login เมื่อสำเร็จ
      await api.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      navigate("/login", { state: { message: "สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ" } });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
