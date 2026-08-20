// Hook ให้ Page อ่านข้อมูลจาก AuthProvider ได้ง่าย
// ตัวอย่าง: const { user, login, logout } = useAuth()
import { useContext } from "react";
import AuthContext from "./authContext.js";

export default function useAuth() {
  // ซ่อนรายละเอียด useContext เพื่อให้ Page เรียกสั้นและอ่านง่าย
  return useContext(AuthContext);
}
