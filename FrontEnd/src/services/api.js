// ลำดับอ่าน Frontend 6: Axios ตัวกลางที่ทุก Page ใช้เรียก Backend
// Interceptor นำ JWT ไปใส่ Authorization ให้อัตโนมัติ
import axios from "axios";

// อ่าน URL จาก Environment และใช้ localhost เป็นค่าเริ่มต้นตอนพัฒนา
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ทุก Page import instance นี้ จึงไม่ต้องเขียน Base URL ซ้ำ
const api = axios.create({ baseURL: apiUrl });

export function getAssetUrl(imageUrl) {
  // Backend เก็บ URL แบบ /uploads/... ฟังก์ชันนี้เติม Domain ให้ Browser เปิดได้
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  // Production ใช้ /api แบบ relative จึงอ่าน origin จากหน้าเว็บปัจจุบัน
  const origin = apiUrl.startsWith("http") ? new URL(apiUrl).origin : window.location.origin;
  return `${origin}${imageUrl}`;
}

api.interceptors.request.use((config) => {
  // Interceptor ทำงานก่อน Request ทุกครั้ง
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getErrorMessage(error) {
  // เลือกข้อความ Zod ก่อน แล้วค่อยข้อความทั่วไปจาก Controller
  const validationError = error.response?.data?.errors?.[0]?.message;
  return validationError || error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

export default api;
