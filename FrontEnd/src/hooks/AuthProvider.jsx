// ลำดับอ่าน Frontend 3: จัดการ User, Token, Login และ Logout
// เมื่อได้ Token จะเรียก /users/me เพื่อโหลด User จาก Backend
import { useEffect, useState } from "react";
import api from "../services/api.js";
import AuthContext from "./authContext.js";

export default function AuthProvider({ children }) {
  // user=null หมายถึงยังไม่ได้ Login; loading ใช้รอตรวจ Token ตอนเปิดเว็บ
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    // Token ถูกเก็บใน Browser เพื่อให้ยัง Login อยู่หลัง Refresh
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      // api.js แนบ Token แล้ว Backend คืน User ที่ไม่รวม password
      const response = await api.get("/users/me");
      setUser(response.data.user);
      return response.data.user;
    } catch {
      // Token ผิด/หมดอายุ ให้ล้างข้อมูลและกลับสภาพไม่ได้ Login
      localStorage.removeItem("token");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // ทำครั้งเดียวตอน Provider เริ่มทำงาน เพื่อตรวจ Session เดิม
    loadUser();
  }, []);

  async function login(email, password) {
    // Login รับ Token ก่อน แล้ว loadUser เพื่อดึงชื่อ email และ role
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    return loadUser();
  }

  function logout() {
    // Logout ฝั่ง Frontend คือการลบ Token และ User ออกจาก State
    localStorage.removeItem("token");
    setUser(null);
  }

  // value คือข้อมูล/ฟังก์ชันที่ useAuth() ในทุก Page สามารถเรียกใช้
  return <AuthContext.Provider value={{ user, loading, login, logout, reloadUser: loadUser }}>{children}</AuthContext.Provider>;
}
