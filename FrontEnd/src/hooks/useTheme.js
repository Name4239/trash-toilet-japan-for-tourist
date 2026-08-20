// Hook สำหรับอ่าน theme/setTheme จาก ThemeProvider
// ProfilePage ใช้ Hook นี้สร้างปุ่มเลือกธีม
import { useContext } from "react";
import ThemeContext from "./themeContext.js";

export default function useTheme() {
  // คืน { theme, setTheme } ที่ ThemeProvider ส่งไว้
  return useContext(ThemeContext);
}
