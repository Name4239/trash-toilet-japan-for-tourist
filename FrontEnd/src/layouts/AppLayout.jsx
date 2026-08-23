import { Outlet } from "react-router-dom"; // ลำดับอ่าน Frontend 4: โครงหน้าหลักหลัง Login มี Page และ Bottom Navigation | Outlet คือหน้าที่ App.jsx เลือกตาม URL ปัจจุบัน
import BottomNav from "../components/BottomNav.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function AppLayout() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    // max-w-md ทำให้ Desktop แสดงทรงหน้าจอมือถืออยู่กึ่งกลาง
    <div className="mx-auto min-h-screen max-w-md bg-cream-50 shadow-2xl md:my-6 md:min-h-[calc(100vh-3rem)] md:overflow-hidden md:rounded-[2rem]">
      <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-7rem)]">
        {/* App.jsx นำ Page ที่ตรง URL มาใส่ตรง Outlet */}
        <Outlet />
      </main>
      {/* BottomNav อยู่นอก Outlet จึงแสดงร่วมกับทุก Page */}
      <BottomNav />
    </div>
  );
}
