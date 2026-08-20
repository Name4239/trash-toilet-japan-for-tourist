// กล่องกลางสำหรับส่ง Theme และ setTheme ไปทุกหน้า
// ThemeProvider เป็นผู้ใส่ค่า ส่วน useTheme เป็นผู้อ่าน
import { createContext } from "react";

// ค่าเริ่ม null และถูกแทนด้วย { theme, setTheme } ใน ThemeProvider
const ThemeContext = createContext(null);

// Provider และ useTheme ต้องใช้ Context กล่องเดียวกัน
export default ThemeContext;
