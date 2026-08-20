# Trash & Toilet Japan — API Preview

Base URL ตอนพัฒนา: `http://localhost:3000/api`

## Models ปัจจุบัน

### User

`id`, `name`, `email`, `password`, `avatarUrl`, `role`, timestamps

### Place

`id`, `name`, `type`, `address`, `imageUrl`, `latitude`, `longitude`, `status`, `createdById`, timestamps

### Report

`id`, `reason`, `description`, `evidenceImageUrl`, `status`, `placeId`, `reporterId`, timestamps

## Authentication

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/auth/register` | Public | JSON: name, email, password |
| POST | `/auth/login` | Public | JSON: email, password |
| GET | `/users/me` | Login | - |
| PATCH | `/users/me/avatar` | Login | FormData: avatar |

Login ใช้ Email/Password และ JWT ไม่มี Google Login

## Places

| Method | Endpoint | Access | หมายเหตุ |
|---|---|---|---|
| GET | `/places` | Public | active เท่านั้น หรือ Admin ใช้ status=all |
| GET | `/places/nearby` | Public | latitude, longitude, radius(km) |
| GET | `/places/:id` | Public | รายละเอียด |
| POST | `/places` | Login | FormData + image |
| GET | `/places/pending` | Admin | คำขอรออนุมัติ |
| PATCH | `/places/:id/status` | Admin | JSON: status |
| DELETE | `/places/:id` | Admin | ลบ Place, รูป และ Reports ที่เกี่ยวข้อง |

### POST /places FormData

```text
name        Shibuya Public Toilet
type        toilet
address     Shibuya, Tokyo
latitude    35.6595
longitude   139.7005
image       [เลือกไฟล์รูป]
```

Member ถูกตั้ง `pending` และ Admin ถูกตั้ง `active` โดย Backend

## Reports

| Method | Endpoint | Access | หมายเหตุ |
|---|---|---|---|
| POST | `/reports` | Login | FormData + evidence |
| GET | `/reports?status=pending` | Admin | รายการ Report |
| GET | `/reports/:id` | Admin | รวม Place, Reporter และรูปหลักฐาน |
| PATCH | `/reports/:id/status` | Admin | resolved หรือ rejected |

### POST /reports FormData

```text
placeId      1
reason       not_exists
description  ไม่พบสถานที่ตามตำแหน่งนี้
evidence     [เลือกไฟล์รูปหลักฐาน]
```

รูปหลักฐานเก็บชั่วคราวใน `uploads` เมื่อ Admin จัดการ Report หรือ Place ถูกลบ ไฟล์หลักฐานจะถูกลบ

## JWT Header

```text
Authorization: Bearer YOUR_TOKEN
```

## Status สำคัญ

- Place: `pending`, `active`, `rejected`, `inactive`
- Report: `pending`, `resolved`, `rejected`
- Role: `member`, `admin`
