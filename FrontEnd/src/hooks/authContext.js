// กล่องกลางสำหรับส่ง User และฟังก์ชัน Login/Logout ไปทุก Component
// ค่าจริงมาจาก AuthProvider.jsx และอ่านผ่าน useAuth.js
import { createContext } from "react";

// ค่าเริ่ม null เพราะ AuthProvider จะส่ง value จริงตอน Render
const AuthContext = createContext(null);

// Provider และ useAuth ต้องใช้ Context กล่องเดียวกัน
export default AuthContext;
