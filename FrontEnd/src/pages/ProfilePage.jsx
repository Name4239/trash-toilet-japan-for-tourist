import { Camera, LogOut, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
// แสดง User พร้อม Avatar, Theme, Admin link และ Logout | เปลี่ยน Avatar แล้ว reloadUser เพื่ออ่านค่าล่าสุดจาก Backend
import { useRef, useState } from "react";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { useNavigate } from "react-router-dom";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../components/PageHeader.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button } from "../components/ui.jsx";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import useAuth from "../hooks/useAuth.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import useTheme from "../hooks/useTheme.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getAssetUrl, getErrorMessage } from "../services/api.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function ProfilePage() {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const { user, logout, reloadUser } = useAuth();
  // ดึงข้อมูลจาก AuthProvider/ThemeProvider แทนการเรียก API ซ้ำเอง
  const navigate = useNavigate();
  // อ่านค่าจาก React Hook ที่ Component ต้องใช้ในรอบ render นี้
  const { theme, setTheme } = useTheme();
  // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
  const fileInputRef = useRef(null);
  // ref ใช้เปิด input ที่ซ่อนไว้เมื่อผู้ใช้แตะรูป Avatar
  const [uploading, setUploading] = useState(false);
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [message, setMessage] = useState("");
  // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  function handleLogout() {
  // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    logout();
    // ล้าง Token ก่อนพาไปหน้า Login
    navigate("/login");
    // เปลี่ยน URL และนำผู้ใช้ไปยังหน้าที่กำหนด
  }

  async function handleAvatarChange(event) {
  // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    const file = event.target.files?.[0];
    // รับไฟล์จากกล้อง/คลังรูป แล้วส่งเป็น multipart/form-data
    if (!file) return;
    // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน

    setUploading(true);
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setMessage("");
    // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    try {
    // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
      const formData = new FormData();
      // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
      formData.append("avatar", file);
      await api.patch("/users/me/avatar", formData);
      // รอ Promise นี้ทำงานเสร็จก่อนใช้ผลลัพธ์หรือทำบรรทัดถัดไป
      await reloadUser();
      // โหลด /users/me ใหม่เพื่อให้ avatarUrl บนหน้าจอเป็นค่าล่าสุด
      setMessage("เปลี่ยนรูปโปรไฟล์สำเร็จ");
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    } catch (requestError) {
      setMessage(getErrorMessage(requestError));
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    } finally {
      setUploading(false);
      // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      event.target.value = "";
    }
  }

  return (
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div>
      <PageHeader title="โปรไฟล์" />
      <section className="px-5 py-8 text-center">
        {/* ปุ่มรูปทำหน้าที่เปิด file input ที่ซ่อนอยู่ */}
        <button className="relative mx-auto block" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-orange-100 text-brand ring-4 ring-white">
            {user.avatarUrl ? <img className="h-full w-full object-cover" src={getAssetUrl(user.avatarUrl)} alt="รูปโปรไฟล์" /> : <UserRound size={44} />}
          </span>
          <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-brand text-white shadow"><Camera size={16} /></span>
        </button>
        <input ref={fileInputRef} className="hidden" type="file" accept="image/*" capture="user" onChange={handleAvatarChange} />
        <p className="mt-2 text-xs text-stone-500">{uploading ? "กำลังอัปโหลด..." : "แตะรูปเพื่อเปลี่ยนรูปโปรไฟล์"}</p>
        {message && <p className="mt-2 text-sm text-brand">{message}</p>}
        <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-stone-500">{user.email}</p>
        <div className="mt-8 rounded-2xl bg-white p-4 text-left shadow-sm">
          <div className="flex items-center justify-between"><span>สิทธิ์ผู้ใช้</span><span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-leaf"><ShieldCheck size={16} />{user.role}</span></div>
        </div>
        {/* Theme เก็บใน localStorage ไม่ได้บันทึกลง Database */}
        <div className="mt-3 rounded-2xl bg-white p-4 text-left shadow-sm">
          <p className="mb-3 font-semibold">ธีมหน้าจอ</p>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream-100 p-1">
            <button
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${theme === "light" ? "bg-white font-semibold text-brand shadow-sm" : "text-stone-500"}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={17} />ธีมปกติ
            </button>
            <button
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${theme === "dark" ? "bg-stone-700 font-semibold text-orange-300 shadow-sm" : "text-stone-500"}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={17} />ธีมมืด
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-500">ระบบจะจำธีมนี้ไว้ในเครื่อง</p>
        </div>
        {user.role === "admin" && <Button className="mt-4 w-full" variant="success" onClick={() => navigate("/admin/places")}>เปิดหน้าจัดการ Admin</Button>}
        <Button className="mt-3 w-full" variant="outline" onClick={handleLogout}><LogOut size={18} />ออกจากระบบ</Button>
      </section>
    </div>
  );
}
