export async function reverseGeocode(latitude, longitude, signal) { // แปลง latitude/longitude เป็นที่อยู่ด้วย OpenStreetMap Nominatim | PlaceForm เรียกหลังผู้ใช้กดใช้ตำแหน่งปัจจุบัน แล้วนำผลไปเติม Address
  const params = new URLSearchParams({ // URLSearchParams ช่วย encode Query String ให้ปลอดภัย
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    "accept-language": "th,en",
  });

  const response = await fetch( // signal มาจาก AbortController เพื่อยกเลิก Request เก่าที่ไม่ใช้แล้ว
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    { signal }
  );

  if (!response.ok) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    throw new Error("ไม่สามารถค้นหาที่อยู่ได้"); // หยุดงานปัจจุบันและส่ง Error ให้ catch หรือผู้เรียกจัดการ
  }

  const data = await response.json(); // Nominatim คืน JSON และ display_name คือที่อยู่แบบเต็ม
  return data.display_name || ""; // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
}
