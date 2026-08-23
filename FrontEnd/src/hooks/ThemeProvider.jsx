import { useEffect, useState } from "react"; // จัดการ Light/Dark Theme และจำค่าด้วย localStorage | เมื่อ Theme เปลี่ยนจะเพิ่มหรือลบ class dark ที่แท็ก html
import ThemeContext from "./themeContext.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function ThemeProvider({ children }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light"); // อ่านค่าที่เคยเลือกจาก Browser; ถ้าไม่มีใช้ light

  useEffect(() => { // กำหนด Side effect ให้ทำงานเมื่อ Component render และ Dependency เปลี่ยน
    document.documentElement.classList.toggle("dark", theme === "dark"); // ใส่ class dark ที่ <html> เพื่อให้ทุกหน้าเปลี่ยนธีมพร้อมกัน
    localStorage.setItem("theme", theme); // อ่านหรือเขียนข้อมูลที่ต้องคงอยู่ใน Browser หลังรีเฟรชหน้า
  }, [theme]);

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    // ส่งทั้งค่าปัจจุบันและฟังก์ชันเปลี่ยนค่าให้ useTheme()
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
