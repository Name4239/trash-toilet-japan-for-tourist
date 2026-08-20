# คู่มือทำความเข้าใจ Frontend

## ลำดับอ่านไฟล์

```text
1. src/main.jsx
2. src/App.jsx
3. src/hooks/AuthProvider.jsx และ ThemeProvider.jsx
4. src/components/ProtectedRoute.jsx
5. src/layouts/AppLayout.jsx
6. src/services/api.js
7. src/components/
8. src/pages/
```

ไฟล์โค้ดหลักมี Comment ด้านบนบอกว่าไฟล์รับข้อมูลมาจากไหนและควรอ่านไฟล์ใดต่อ

## การเริ่มแอป

```text
main.jsx
→ ThemeProvider
→ BrowserRouter
→ AuthProvider โหลด Token/User
→ App.jsx เลือกหน้าจาก URL
→ ProtectedRoute ตรวจ Login/Admin
→ AppLayout วาง Page และ BottomNav
```

## Login

```text
LoginPage
→ useAuth.login
→ POST /auth/login
→ เก็บ JWT ใน localStorage
→ GET /users/me
→ เก็บ user ใน AuthContext
```

Login ปัจจุบันใช้ Email/Password เท่านั้น ไม่มี Google Login

## Map และ GPS

```text
MapHomePage
→ GET /api/places (active)
→ react-geolocated อ่าน GPS
→ PlaceMap แสดง OpenStreetMap
→ วาด Marker ห้องน้ำ/ถังขยะจาก Database
```

## ค้นหา

`SearchPage` เริ่มต้นที่ 500 เมตร รับ GPS แล้วเรียก `/places/nearby` ผู้ใช้กรองประเภท ห้องน้ำ/ถังขยะ หรือเลือกทั้งหมดได้

## เพิ่ม Place พร้อมรูป

```text
PlaceForm
→ เลือก/ถ่ายรูป + GPS + ที่อยู่
→ AddPlacePage สร้าง FormData field image
→ POST /api/places
```

Member ได้ `pending` ส่วน Admin ได้ `active`

## Report พร้อมรูปหลักฐาน

```text
ReportPage
→ เลือกเหตุผล + รายละเอียด + รูป
→ สร้าง FormData field evidence
→ POST /api/reports
→ AdminReportDetailPage แสดงรูปหลักฐาน
```

รูปหลักฐานถูกเก็บชั่วคราว Backend จะลบเมื่อ Admin จัดการ Report หรือ Place ถูกลบ

## Profile

- `PATCH /users/me/avatar` ส่ง FormData field `avatar`
- `reloadUser()` โหลด Avatar ใหม่
- ThemeProvider จำ Light/Dark Theme ใน localStorage
- Member และ Admin ใช้ Profile/Logout เดียวกัน

## หน้า Member

- `LoginPage.jsx` เข้าสู่ระบบ
- `RegisterPage.jsx` สมัครสมาชิก
- `MapHomePage.jsx` Map/GPS
- `SearchPage.jsx` ค้นหา/กรอง
- `PlaceDetailPage.jsx` รายละเอียด/รายงาน
- `AddPlacePage.jsx` เพิ่ม Place
- `ReportPage.jsx` ส่ง Report พร้อมหลักฐาน
- `ProfilePage.jsx` Avatar/Theme/Logout

## หน้า Admin

- `AdminPlacesPage.jsx` ดูและลบ Place
- `AdminPendingPlacesPage.jsx` อนุมัติ/ปฏิเสธ Place
- `AddPlacePage admin` เพิ่ม Place active
- `AdminReportsPage.jsx` ดู Report pending
- `AdminReportDetailPage.jsx` ดูหลักฐานและจัดการ

## Run และตรวจโค้ด

```powershell
cd FrontEnd
npm run dev
npm run lint
npm run build
```
