// เมนูด้านล่าง เลือกรายการต่างกันตาม role member/admin
// AppLayout วาง Component นี้ใต้หน้าปัจจุบัน
import { ClipboardList, FileWarning, House, MapPinPlus, Search, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function BottomNav() {
  // อ่าน User จาก Context เพราะ role เป็นตัวตัดสินว่าจะใช้เมนูชุดใด
  const { user } = useAuth();

  // Admin มี 5 เมนู ส่วน Member มี 4 เมนู
  const links = user?.role === "admin"
    ? [
        { to: "/admin/add-place", label: "เพิ่ม", icon: MapPinPlus },
        { to: "/admin/places", label: "สถานที่", icon: Search },
        { to: "/admin/pending", label: "อนุมัติ", icon: ClipboardList },
        { to: "/admin/reports", label: "รายงาน", icon: FileWarning },
        { to: "/profile", label: "โปรไฟล์", icon: UserRound },
      ]
    : [
        { to: "/", label: "หน้าหลัก", icon: House },
        { to: "/search", label: "ค้นหา", icon: Search },
        { to: "/add-place", label: "เพิ่ม", icon: MapPinPlus },
        { to: "/profile", label: "โปรไฟล์", icon: UserRound },
      ];

  return (
    // sticky ทำให้เมนูติดอยู่ด้านล่างขณะเลื่อนหน้า
    <nav className={`sticky bottom-0 z-[1000] grid border-t border-cream-200 bg-white/95 backdrop-blur ${links.length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
      {/* วนข้อมูล links เพื่อสร้างปุ่ม โดย NavLink บอกได้ว่าปุ่มใดกำลัง active */}
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] ${isActive ? "text-brand" : "text-stone-400"}`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
