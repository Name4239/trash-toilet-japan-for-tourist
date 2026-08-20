// ลำดับอ่าน Frontend 1: จุดเริ่มต้นของ React ครอบ Theme, Router และ Auth
// อ่านต่อ App.jsx เพื่อดูว่า URL แต่ละอันเปิดหน้าใด
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./hooks/AuthProvider.jsx";
import ThemeProvider from "./hooks/ThemeProvider.jsx";

// นำ React ไปแสดงใน <div id="root"> ของ index.html
createRoot(document.getElementById("root")).render(
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
