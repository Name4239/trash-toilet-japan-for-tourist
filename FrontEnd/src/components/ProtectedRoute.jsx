import { Navigate, Outlet } from "react-router-dom";
// ประตูตรวจสิทธิ์ก่อนเปิดหน้าที่ต้อง Login หรือ Admin | ผ่านแล้วแสดง Outlet; ไม่ผ่านจะ Navigate ไปหน้าที่เหมาะสม
import useAuth from "../hooks/useAuth.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { PageLoader } from "./ui.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function ProtectedRoute({ adminOnly = false }) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const { user, loading } = useAuth();
  // ข้อมูลนี้ถูกโหลดโดย AuthProvider ก่อน ProtectedRoute ตัดสินใจ

  if (loading) return <PageLoader />;
  // ต้องเช็กตามลำดับ: รอโหลด → ตรวจ Login → ตรวจ Admin
  if (!user) return <Navigate to="/login" replace />;
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน

  return <Outlet />;
  // ผ่านทุกเงื่อนไขแล้วจึงแสดง Route ลูกจาก App.jsx
}
