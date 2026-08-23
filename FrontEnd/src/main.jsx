import { StrictMode } from "react"; // ลำดับอ่าน Frontend 1: จุดเริ่มต้นของ React ครอบ Theme, Router และ Auth | อ่านต่อ App.jsx เพื่อดูว่า URL แต่ละอันเปิดหน้าใด
import { createRoot } from "react-dom/client"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { BrowserRouter } from "react-router-dom"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import "leaflet/dist/leaflet.css"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import "./index.css"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import App from "./App.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AuthProvider from "./hooks/AuthProvider.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import ThemeProvider from "./hooks/ThemeProvider.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

createRoot(document.getElementById("root")).render( // นำ React ไปแสดงใน <div id="root"> ของ index.html
  <StrictMode>
    {/* Provider ชั้นนอกส่งข้อมูลให้ Component ทุกตัวที่อยู่ด้านใน */}
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
