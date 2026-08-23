import { createContext } from "react"; // กล่องกลางสำหรับส่ง Theme และ setTheme ไปทุกหน้า | ThemeProvider เป็นผู้ใส่ค่า ส่วน useTheme เป็นผู้อ่าน

const ThemeContext = createContext(null); // ค่าเริ่ม null และถูกแทนด้วย { theme, setTheme } ใน ThemeProvider

export default ThemeContext; // Provider และ useTheme ต้องใช้ Context กล่องเดียวกัน
