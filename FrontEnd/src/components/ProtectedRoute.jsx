// ประตูตรวจสิทธิ์ก่อนเปิดหน้าที่ต้อง Login หรือ Admin
// ผ่านแล้วแสดง Outlet; ไม่ผ่านจะ Navigate ไปหน้าที่เหมาะสม
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { PageLoader } from "./ui.jsx";

export default function ProtectedRoute({ adminOnly = false }) {
  // ข้อมูลนี้ถูกโหลดโดย AuthProvider ก่อน ProtectedRoute ตัดสินใจ
  const { user, loading } = useAuth();

  // ต้องเช็กตามลำดับ: รอโหลด → ตรวจ Login → ตรวจ Admin
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  // ผ่านทุกเงื่อนไขแล้วจึงแสดง Route ลูกจาก App.jsx
  return <Outlet />;
}
