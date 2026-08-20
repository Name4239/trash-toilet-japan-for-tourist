// ลำดับอ่าน Frontend 2: รวม Route ทุกหน้า และกำหนดหน้าที่ต้อง Login/Admin
// อ่านต่อ ProtectedRoute.jsx และ AppLayout.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AddPlacePage from "./pages/AddPlacePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MapHomePage from "./pages/MapHomePage.jsx";
import PlaceDetailPage from "./pages/PlaceDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AdminPendingPlacesPage from "./pages/admin/AdminPendingPlacesPage.jsx";
import AdminPlacesPage from "./pages/admin/AdminPlacesPage.jsx";
import AdminReportDetailPage from "./pages/admin/AdminReportDetailPage.jsx";
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx";

export default function App() {
  return (
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
