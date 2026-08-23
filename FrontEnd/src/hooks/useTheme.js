import { useContext } from "react";
// Hook สำหรับอ่าน theme/setTheme จาก ThemeProvider | ProfilePage ใช้ Hook นี้สร้างปุ่มเลือกธีม
import ThemeContext from "./themeContext.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function useTheme() {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return useContext(ThemeContext);
  // คืน { theme, setTheme } ที่ ThemeProvider ส่งไว้
}
