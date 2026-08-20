// จัดการ Light/Dark Theme และจำค่าด้วย localStorage
// เมื่อ Theme เปลี่ยนจะเพิ่มหรือลบ class dark ที่แท็ก html
import { useEffect, useState } from "react";
import ThemeContext from "./themeContext.js";

export default function ThemeProvider({ children }) {
  // อ่านค่าที่เคยเลือกจาก Browser; ถ้าไม่มีใช้ light
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    // ใส่ class dark ที่ <html> เพื่อให้ทุกหน้าเปลี่ยนธีมพร้อมกัน
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    // ส่งทั้งค่าปัจจุบันและฟังก์ชันเปลี่ยนค่าให้ useTheme()
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
