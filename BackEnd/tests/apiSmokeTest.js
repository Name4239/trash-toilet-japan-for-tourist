import "dotenv/config"; // อ่านไฟล์นี้หลังเข้าใจ API แล้ว: เป็นผู้ใช้จำลองที่เรียก API ตาม Flow จริง | ลำดับทดสอบอยู่ใน runTests() และ finally จะ cleanup ข้อมูลที่ script สร้าง
import fs from "fs";
import path from "path";

import { prisma } from "../src/lib/prisma.js";

const baseUrl = `http://localhost:${process.env.PORT || 5000}`; // ชุดทดสอบนี้ต้องรันหลัง npm run dev และจะลบข้อมูลทดสอบของตัวเองเมื่อจบ
const uniqueId = Date.now();
const memberEmail = `member-${uniqueId}@example.com`;
const adminEmail = `admin-${uniqueId}@example.com`;
const password = "test123456";

let memberId;
let adminId;
let avatarUrl;

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await response.json();
  return { status: response.status, data };
}

function expect(name, condition) {
  if (!condition) {
    throw new Error(`FAIL: ${name}`);
  }

  console.log(`PASS: ${name}`);
}

async function register(name, email) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

async function login(email) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function runTests() {
  const memberRegister = await register("Test Member", memberEmail); // 1) สร้าง Member และ Admin สำหรับการทดสอบครั้งนี้
  const adminRegister = await register("Test Admin", adminEmail);
  expect("Register member", memberRegister.status === 201);
  expect("Register admin account", adminRegister.status === 201);

  memberId = memberRegister.data.user.id;
  adminId = adminRegister.data.user.id;

  await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } }); // Register API สร้างทุกคนเป็น member จึงเปลี่ยน test account นี้เป็น admin โดยตรง

  const memberLogin = await login(memberEmail); // 2) Login หลังเปลี่ยน role เพื่อให้ JWT ของ Admin มี role ที่ถูกต้อง
  const adminLogin = await login(adminEmail);
  expect("Login member", Boolean(memberLogin.data.token));
  expect("Login admin", Boolean(adminLogin.data.token));

  const memberHeaders = { Authorization: `Bearer ${memberLogin.data.token}` };
  const adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };

  const profile = await request("/api/users/me", { headers: memberHeaders }); // 3) ตรวจ Profile จาก JWT
  expect("Get current user", profile.data.user.email === memberEmail);

  const avatarForm = new FormData();
  avatarForm.append(
    "avatar",
    new Blob(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64"
        ),
      ],
      { type: "image/png" }
    ),
    "test-avatar.png"
  );

  const updatedAvatar = await request("/api/users/me/avatar", {
    method: "PATCH",
    headers: memberHeaders,
    body: avatarForm,
  });
  avatarUrl = updatedAvatar.data.user?.avatarUrl;
  expect("Update profile avatar", Boolean(avatarUrl));

  const uploadedAvatar = await fetch(`${baseUrl}${avatarUrl}`);
  expect("Uploaded avatar can be opened", uploadedAvatar.status === 200);

  const placeForm = new FormData(); // 4) Member เพิ่ม Place ต้องได้ pending
  placeForm.append("name", "Test Member Toilet");
  placeForm.append("type", "toilet");
  placeForm.append("address", "Tokyo Test Address");
  placeForm.append("latitude", "35.6812");
  placeForm.append("longitude", "139.7671");
  placeForm.append( // รูป PNG ขนาดเล็กใช้เฉพาะทดสอบระบบ upload
    "image",
    new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64")], { type: "image/png" }),
    "test-place.png"
  );

  const memberPlace = await request("/api/places", {
    method: "POST",
    headers: memberHeaders,
    body: placeForm,
  });
  expect("Member place is pending", memberPlace.data.place.status === "pending");
  expect("Place stores image URL", Boolean(memberPlace.data.place.imageUrl));
  const uploadedImage = await fetch(`${baseUrl}${memberPlace.data.place.imageUrl}`);
  expect("Uploaded image can be opened", uploadedImage.status === 200);

  const memberPendingAccess = await request("/api/places/pending", { // 5) Member ต้องเข้า Admin API ไม่ได้
    headers: memberHeaders,
  });
  expect("Member cannot access pending places", memberPendingAccess.status === 403);

  const pendingPlaces = await request("/api/places/pending", { // 6) Admin ดูคำขอและอนุมัติ Place
    headers: adminHeaders,
  });
  expect(
    "Admin sees pending place",
    pendingPlaces.data.places.some((place) => place.id === memberPlace.data.place.id)
  );

  const approvedPlace = await request(
    `/api/places/${memberPlace.data.place.id}/status`,
    {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ status: "active" }),
    }
  );
  expect("Admin approves place", approvedPlace.data.place.status === "active");

  const adminPlaceForm = new FormData(); // Admin เพิ่ม Place ต้องเป็น active และปรากฏใน Public Map ทันที
  adminPlaceForm.append("name", "Test Admin Trash Point");
  adminPlaceForm.append("type", "trash");
  adminPlaceForm.append("address", "Tokyo Admin Test Address");
  adminPlaceForm.append("latitude", "35.6815");
  adminPlaceForm.append("longitude", "139.7675");
  adminPlaceForm.append(
    "image",
    new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64")], { type: "image/png" }),
    "test-admin-place.png"
  );

  const adminPlace = await request("/api/places", {
    method: "POST",
    headers: adminHeaders,
    body: adminPlaceForm,
  });
  expect("Admin place is active immediately", adminPlace.data.place.status === "active");

  const activePlaces = await request("/api/places"); // 7) Public Map และ Nearby ต้องมองเห็น Place ที่ active
  expect(
    "Public sees active place",
    activePlaces.data.places.some((place) => place.id === memberPlace.data.place.id)
  );
  expect(
    "Public map sees admin place",
    activePlaces.data.places.some((place) => place.id === adminPlace.data.place.id)
  );

  const placeDetail = await request(`/api/places/${adminPlace.data.place.id}`);
  expect("Get place detail", placeDetail.data.place.id === adminPlace.data.place.id);

  const nearbyPlaces = await request(
    "/api/places/nearby?latitude=35.6812&longitude=139.7671&radius=1"
  );
  expect(
    "Nearby returns active place",
    nearbyPlaces.data.places.some((place) => place.id === memberPlace.data.place.id)
  );

  const reportForm = new FormData(); // 8) Member ส่ง Report ต้องเริ่มเป็น pending
  reportForm.append("placeId", String(memberPlace.data.place.id));
  reportForm.append("reason", "test_reason");
  reportForm.append("description", "Created by automated API test");
  reportForm.append(
    "evidence",
    new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64")], { type: "image/png" }),
    "test-report-evidence.png"
  );

  const createdReport = await request("/api/reports", {
    method: "POST",
    headers: memberHeaders,
    body: reportForm,
  });
  expect("Report starts pending", createdReport.data.report.status === "pending");
  expect("Report stores evidence URL", Boolean(createdReport.data.report.evidenceImageUrl));

  const reports = await request("/api/reports", { headers: adminHeaders }); // 9) Admin อ่านรายละเอียดและ resolve Report
  expect(
    "Admin sees reports",
    reports.data.reports.some((report) => report.id === createdReport.data.report.id)
  );

  const reportDetail = await request(`/api/reports/${createdReport.data.report.id}`, {
    headers: adminHeaders,
  });
  expect("Admin sees report detail", reportDetail.status === 200);
  expect("Admin sees report evidence", Boolean(reportDetail.data.report.evidenceImageUrl));

  const resolvedReport = await request(
    `/api/reports/${createdReport.data.report.id}/status`,
    {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ status: "resolved" }),
    }
  );
  expect("Admin resolves report", resolvedReport.data.report.status === "resolved");

  const allPlaces = await request("/api/places?status=all", { headers: adminHeaders }); // 10) Admin ดูทุก Place และลบ Place ได้
  expect("Admin sees all places", allPlaces.status === 200);

  const deletedPlace = await request(`/api/places/${memberPlace.data.place.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  expect("Admin deletes place", deletedPlace.status === 200);

  const deletedAdminPlace = await request(`/api/places/${adminPlace.data.place.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  expect("Admin deletes own place", deletedAdminPlace.status === 200);
}

try {
  await runTests();
  console.log("All Backend API tests passed.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (memberId || adminId) { // ลบเฉพาะ Users ที่ script สร้าง Relations จะถูกลบตามด้วย Cascade
    await prisma.user.deleteMany({
      where: { id: { in: [memberId, adminId].filter(Boolean) } },
    });
  }

  if (avatarUrl) {
    const avatarPath = path.resolve(avatarUrl.replace(/^\//, ""));
    if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
  }

  await prisma.$disconnect(); // ปิด Database connection เพื่อให้ Node จบการทำงาน
}
