import { useContext } from "react";
// Hook ให้ Page อ่านข้อมูลจาก AuthProvider ได้ง่าย | ตัวอย่าง: const { user, login, logout } = useAuth()
import AuthContext from "./authContext.js";
// นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function useAuth() {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return useContext(AuthContext);
  // ซ่อนรายละเอียด useContext เพื่อให้ Page เรียกสั้นและอ่านง่าย
}
