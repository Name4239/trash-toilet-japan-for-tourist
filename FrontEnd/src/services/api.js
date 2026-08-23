import axios from "axios";
// ลำดับอ่าน Frontend 6: Axios ตัวกลางที่ทุก Page ใช้เรียก Backend | Interceptor นำ JWT ไปใส่ Authorization ให้อัตโนมัติ

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
// อ่าน URL จาก Environment และใช้ localhost เป็นค่าเริ่มต้นตอนพัฒนา

const api = axios.create({ baseURL: apiUrl });
// ทุก Page import instance นี้ จึงไม่ต้องเขียน Base URL ซ้ำ

export function getAssetUrl(imageUrl) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  if (!imageUrl) return "";
  // Backend เก็บ URL แบบ /uploads/... ฟังก์ชันนี้เติม Domain ให้ Browser เปิดได้
  if (imageUrl.startsWith("http")) return imageUrl;
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
  const origin = apiUrl.startsWith("http") ? new URL(apiUrl).origin : window.location.origin;
  // Production ใช้ /api แบบ relative จึงอ่าน origin จากหน้าเว็บปัจจุบัน
  return `${origin}${imageUrl}`;
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Interceptor ทำงานก่อน Request ทุกครั้ง

  if (token) {
  // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
});

export function getErrorMessage(error) {
// ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const validationError = error.response?.data?.errors?.[0]?.message;
  // เลือกข้อความ Zod ก่อน แล้วค่อยข้อความทั่วไปจาก Controller
  return validationError || error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
  // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
}

export default api;
