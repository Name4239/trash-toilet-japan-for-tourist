import { LoaderCircle, Search } from "lucide-react"; // ค้นหา Place ตามชื่อ ประเภท และระยะจาก GPS | ทุกตัวเลือกระยะทางเรียก /places/nearby โดย "ทั้งหมด" จำกัดไว้ที่ 10 กิโลเมตร
import { useCallback, useEffect, useState } from "react"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { useGeolocated } from "react-geolocated"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PageHeader from "../components/PageHeader.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import PlaceCard from "../components/PlaceCard.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import { Button, Chip, EmptyState } from "../components/ui.jsx"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์
import api, { getErrorMessage } from "../services/api.js"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export default function SearchPage() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [search, setSearch] = useState(""); // กลุ่ม State ของ Filter และผลลัพธ์จาก API
  const [type, setType] = useState(""); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [radius, setRadius] = useState(500); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [places, setPlaces] = useState([]); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [error, setError] = useState(""); // กลุ่ม State ของสถานะหน้าจอขณะรอ GPS/API
  const [loading, setLoading] = useState(true); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [waitingForGps, setWaitingForGps] = useState(true); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [pendingFilters, setPendingFilters] = useState({ type: "", radius: 500, search: "" }); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน
  const [hasSearched, setHasSearched] = useState(false); // สร้าง State และฟังก์ชันเปลี่ยนค่าเพื่อให้ React render ใหม่เมื่อข้อมูลเปลี่ยน

  const { // ขอ GPS ตั้งแต่เปิดหน้า เพราะค่าเริ่มต้นค้นหาในระยะ 500 เมตร
    coords,
    getPosition,
    positionError,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    suppressLocationOnMount: false,
  });

  const runSearch = useCallback( // ใช้ฟังก์ชันเดียวกันทั้งตอนกดค้นหา และตอนที่ GPS ส่งพิกัดกลับมา
    async (currentCoords = coords, filters = {}) => {
      const selectedType = filters.type ?? type; // filters ที่ส่งเข้ามามีสิทธิ์แทน State ใช้แก้ปัญหา setState ยังไม่อัปเดตทันที
      const selectedRadius = filters.radius ?? radius; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
      const selectedSearch = filters.search ?? search; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่
      setLoading(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setError(""); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด

      try { // เริ่มดักงานที่อาจเกิด Error เพื่อจัดการผลลัพธ์อย่างควบคุม
        if (selectedRadius) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
          const response = await api.get("/places/nearby", { // Backend รับ radius เป็นกิโลเมตร จึงหารค่าหน่วยเมตรด้วย 1000
            params: {
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
              radius: selectedRadius / 1000,
            },
          });

          const filteredPlaces = response.data.places.filter( // API Nearby กรองระยะแล้ว Frontend กรองประเภทและชื่อซ้ำอีกชั้น
            (place) =>
              (!selectedType || place.type === selectedType) &&
              (!selectedSearch || place.name.toLowerCase().includes(selectedSearch.toLowerCase())),
          );
          setPlaces(filteredPlaces); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
        } else {
          const response = await api.get("/places", { // กรณี radius=0 รองรับการเรียก Place active โดยไม่ใช้ GPS
            params: {
              ...(selectedType && { type: selectedType }),
              ...(selectedSearch && { search: selectedSearch }),
            },
          });
          setPlaces(response.data.places); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
        }

        setHasSearched(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      } catch (requestError) {
        setError(getErrorMessage(requestError)); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      } finally {
        setLoading(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      }
    },
    [coords, radius, search, type],
  );

  useEffect(() => { // ถ้าตอนกดค้นหา GPS ยังไม่มา ให้ค้นหาต่ออัตโนมัติทันทีที่ได้พิกัด
    if (!waitingForGps || !coords) return; // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    setWaitingForGps(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    runSearch(coords, pendingFilters || {});
    setPendingFilters(null); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
  }, [coords, pendingFilters, runSearch, waitingForGps]);

  useEffect(() => { // แสดงข้อผิดพลาดเมื่อผู้ใช้ปิดหรือไม่อนุญาต GPS
    if (!waitingForGps || !positionError) return; // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
    setWaitingForGps(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setLoading(false); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
    setError("ไม่สามารถใช้ตำแหน่งได้ กรุณาอนุญาต Location ในเบราว์เซอร์"); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
  }, [positionError, waitingForGps]);

  function handleSearch() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    if (radius && !coords) { // ถ้ากดก่อน GPS พร้อม ให้จำ Filter แล้วรอ Effect เรียกค้นหาต่อ
      if (!isGeolocationAvailable || !isGeolocationEnabled) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
        setError("อุปกรณ์นี้ปิด GPS หรือไม่รองรับตำแหน่ง"); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
        return;
      }

      setLoading(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setWaitingForGps(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setError(""); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setPendingFilters({ type, radius, search }); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      getPosition();
      return;
    }

    runSearch(coords);
  }

  function applyFilters(nextType, nextRadius) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
    setType(nextType); // กด Chip แล้วค้นหาทันที ไม่ต้องรอกดปุ่มค้นหาอีกครั้ง
    setRadius(nextRadius); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด

    if (nextRadius && !coords) { // ตรวจเงื่อนไขก่อนอนุญาตให้โค้ดภายในทำงาน
      setLoading(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setWaitingForGps(true); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      setPendingFilters({ type: nextType, radius: nextRadius, search }); // อัปเดต React State เพื่อให้หน้าจอ render ตามข้อมูลล่าสุด
      getPosition();
      return;
    }

    runSearch(coords, { type: nextType, radius: nextRadius, search });
  }

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <div>
      <PageHeader title="ค้นหาสถานที่" />
      <section className="space-y-5 px-5 py-5">
        {/* ช่องคำค้นยังไม่ยิง API จนผู้ใช้กดปุ่มหรือเลือก Filter */}
        <div className="flex rounded-xl border border-cream-200 bg-white px-3">
          <Search className="my-auto text-stone-400" size={19} />
          <input
            className="w-full bg-transparent px-3 py-3 outline-none"
            placeholder="ค้นหาสถานที่, พื้นที่..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* Filter ประเภทส่ง toilet/trash หรือค่าว่างสำหรับทั้งหมด */}
        <div>
          <p className="mb-2 text-sm text-stone-500">ประเภท</p>
          <div className="flex gap-2">
            <Chip active={!type} onClick={() => applyFilters("", radius)}>ทั้งหมด</Chip>
            <Chip active={type === "toilet"} onClick={() => applyFilters("toilet", radius)}>ห้องน้ำ</Chip>
            <Chip active={type === "trash"} onClick={() => applyFilters("trash", radius)}>ถังขยะ</Chip>
          </div>
        </div>

        {/* 10000 เมตรใช้เป็น “ทั้งหมด” ภายในบริเวณ 10 กิโลเมตร */}
        <div>
          <p className="mb-2 text-sm text-stone-500">ระยะทางใกล้ฉัน</p>
          <div className="flex gap-2">
            <Chip active={radius === 500} onClick={() => applyFilters(type, 500)}>500 m</Chip>
            <Chip active={radius === 1000} onClick={() => applyFilters(type, 1000)}>1000 m</Chip>
            <Chip active={radius === 10000} onClick={() => applyFilters(type, 10000)}>ทั้งหมด</Chip>
          </div>
        </div>

        <Button className="w-full" disabled={loading} onClick={handleSearch}>
          {loading && <LoaderCircle className="animate-spin" size={18} />}
          {waitingForGps ? "กำลังหาตำแหน่ง..." : "ค้นหา"}
        </Button>

        {error && <p className="text-sm text-danger">{error}</p>}

        {/* มีผลลัพธ์ใช้ PlaceCard; ไม่มีผลหลังค้นหาใช้ EmptyState */}
        <div className="space-y-3">
          {places.length ? (
            places.map((place) => <PlaceCard key={place.id} place={place} />)
          ) : !loading ? (
            <EmptyState
              title={hasSearched ? "ไม่พบสถานที่ใกล้คุณ" : "ยังไม่มีสถานที่"}
              description="ลองเพิ่มระยะทาง หรือเลือกทั้งหมดแล้วค้นหาอีกครั้ง"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
