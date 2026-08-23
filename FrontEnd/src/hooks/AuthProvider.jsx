import { useEffect, useState } from "react"; // ลำดับอ่าน Frontend 3: จัดการ User, Token, Login และ Logout | เมื่อได้ Token จะเรียก /users/me เพื่อโหลด User จาก Backend
import api from "../services/api.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import AuthContext from "./authContext.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function AuthProvider({ children }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [user, setUser] = useState(null); // user=null หมายถึงยังไม่ได้ Login; loading ใช้รอตรวจ Token ตอนเปิดเว็บ
  const [loading, setLoading] = useState(true); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  async function loadUser() { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    const token = localStorage.getItem("token"); // Token ถูกเก็บใน Browser เพื่อให้ยัง Login อยู่หลัง Refresh

    if (!token) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      setLoading(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      return null; // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    }

    try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
      const response = await api.get("/users/me"); // api.js แนบ Token แล้ว Backend คืน User ที่ไม่รวม password
      setUser(response.data.user); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      return response.data.user; // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    } catch {
      localStorage.removeItem("token"); // Token ผิด/หมดอายุ ให้ล้างข้อมูลและกลับสภาพไม่ได้ Login
      setUser(null); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      return null; // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    } finally {
      setLoading(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    }
  }

  useEffect(() => { // กำหนด Side effect ให้ทำงานเมื่อ Component render และ Dependency เปลี่ยน
    loadUser(); // ทำครั้งเดียวตอน Provider เริ่มทำงาน เพื่อตรวจ Session เดิม
  }, []);

  async function login(email, password) { // สร้างฟังก์ชัน async เพื่อให้ใช้ await กับงาน API หรือ Database ได้
    const response = await api.post("/auth/login", { email, password }); // Login รับ Token ก่อน แล้ว loadUser เพื่อดึงชื่อ email และ role
    localStorage.setItem("token", response.data.token); // อ่านหรือเขียนข้อมูลที่ต้องคงอยู่ใน Browser หลังรีเฟรชหน้า
    return loadUser(); // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
  }

  function logout() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    localStorage.removeItem("token"); // Logout ฝั่ง Frontend คือการลบ Token และ User ออกจาก State
    setUser(null); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, reloadUser: loadUser }}>{children}</AuthContext.Provider>; // value คือข้อมูล/ฟังก์ชันที่ useAuth() ในทุก Page สามารถเรียกใช้
}
