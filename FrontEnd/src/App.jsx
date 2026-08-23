import { Navigate, Route, Routes } from "react-router-dom"; // ลำดับอ่าน Frontend 2: รวม Route ทุกหน้า และกำหนดหน้าที่ต้อง Login/Admin | อ่านต่อ ProtectedRoute.jsx และ AppLayout.jsx
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AppLayout from "./layouts/AppLayout.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AddPlacePage from "./pages/AddPlacePage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import LoginPage from "./pages/LoginPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import MapHomePage from "./pages/MapHomePage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PlaceDetailPage from "./pages/PlaceDetailPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import ProfilePage from "./pages/ProfilePage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import RegisterPage from "./pages/RegisterPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import ReportPage from "./pages/ReportPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import SearchPage from "./pages/SearchPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AdminPendingPlacesPage from "./pages/admin/AdminPendingPlacesPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AdminPlacesPage from "./pages/admin/AdminPlacesPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AdminReportDetailPage from "./pages/admin/AdminReportDetailPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function App() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <Routes>
      {/* Public Routes เปิดได้โดยยังไม่ Login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Route กลุ่มนี้ต้องผ่าน ProtectedRoute และใช้ Layout/BottomNav ร่วมกัน */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<MapHomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="places/:id" element={<PlaceDetailPage />} />
          <Route path="places/:id/report" element={<ReportPage />} />
          <Route path="add-place" element={<AddPlacePage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin Routes ตรวจ role เพิ่มอีกชั้น */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="admin/add-place" element={<AddPlacePage admin />} />
            <Route path="admin/places" element={<AdminPlacesPage />} />
            <Route path="admin/pending" element={<AdminPendingPlacesPage />} />
            <Route path="admin/reports" element={<AdminReportsPage />} />
            <Route path="admin/reports/:id" element={<AdminReportDetailPage />} />
          </Route>
        </Route>
      </Route>

      {/* URL ที่ไม่มีในระบบจะกลับหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
