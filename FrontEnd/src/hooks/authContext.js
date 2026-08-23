import { createContext } from "react";
// กล่องกลางสำหรับส่ง User และฟังก์ชัน Login/Logout ไปทุก Component | ค่าจริงมาจาก AuthProvider.jsx และอ่านผ่าน useAuth.js

const AuthContext = createContext(null);
// ค่าเริ่ม null เพราะ AuthProvider จะส่ง value จริงตอน Render

export default AuthContext;
// Provider และ useAuth ต้องใช้ Context กล่องเดียวกัน
