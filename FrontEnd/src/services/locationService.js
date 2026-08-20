// แปลง latitude/longitude เป็นที่อยู่ด้วย OpenStreetMap Nominatim
// PlaceForm เรียกหลังผู้ใช้กดใช้ตำแหน่งปัจจุบัน แล้วนำผลไปเติม Address
export async function reverseGeocode(latitude, longitude, signal) {
  // URLSearchParams ช่วย encode Query String ให้ปลอดภัย
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    "accept-language": "th,en",
  });

  // signal มาจาก AbortController เพื่อยกเลิก Request เก่าที่ไม่ใช้แล้ว
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("ไม่สามารถค้นหาที่อยู่ได้");
  }

  // Nominatim คืน JSON และ display_name คือที่อยู่แบบเต็ม
  const data = await response.json();
  return data.display_name || "";
}
