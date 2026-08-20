// ค้นหา Place ตามชื่อ ประเภท และระยะจาก GPS
// ทุกตัวเลือกระยะทางเรียก /places/nearby โดย "ทั้งหมด" จำกัดไว้ที่ 10 กิโลเมตร
import { LoaderCircle, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import PageHeader from "../components/PageHeader.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import { Button, Chip, EmptyState } from "../components/ui.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function SearchPage() {
  // กลุ่ม State ของ Filter และผลลัพธ์จาก API
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [radius, setRadius] = useState(500);
  const [places, setPlaces] = useState([]);
  // กลุ่ม State ของสถานะหน้าจอขณะรอ GPS/API
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [waitingForGps, setWaitingForGps] = useState(true);
  const [pendingFilters, setPendingFilters] = useState({ type: "", radius: 500, search: "" });
  const [hasSearched, setHasSearched] = useState(false);

  // ขอ GPS ตั้งแต่เปิดหน้า เพราะค่าเริ่มต้นค้นหาในระยะ 500 เมตร
  const {
    coords,
    getPosition,
    positionError,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    suppressLocationOnMount: false,
  });

  // ใช้ฟังก์ชันเดียวกันทั้งตอนกดค้นหา และตอนที่ GPS ส่งพิกัดกลับมา
  const runSearch = useCallback(
    async (currentCoords = coords, filters = {}) => {
      // filters ที่ส่งเข้ามามีสิทธิ์แทน State ใช้แก้ปัญหา setState ยังไม่อัปเดตทันที
      const selectedType = filters.type ?? type;
      const selectedRadius = filters.radius ?? radius;
      const selectedSearch = filters.search ?? search;
      setLoading(true);
      setError("");

      try {
        if (selectedRadius) {
          // Backend รับ radius เป็นกิโลเมตร จึงหารค่าหน่วยเมตรด้วย 1000
          const response = await api.get("/places/nearby", {
            params: {
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
              radius: selectedRadius / 1000,
            },
          });

          // API Nearby กรองระยะแล้ว Frontend กรองประเภทและชื่อซ้ำอีกชั้น
          const filteredPlaces = response.data.places.filter(
            (place) =>
              (!selectedType || place.type === selectedType) &&
              (!selectedSearch || place.name.toLowerCase().includes(selectedSearch.toLowerCase())),
          );
          setPlaces(filteredPlaces);
        } else {
          // กรณี radius=0 รองรับการเรียก Place active โดยไม่ใช้ GPS
          const response = await api.get("/places", {
            params: {
              ...(selectedType && { type: selectedType }),
              ...(selectedSearch && { search: selectedSearch }),
            },
          });
          setPlaces(response.data.places);
        }

        setHasSearched(true);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [coords, radius, search, type],
  );

  // ถ้าตอนกดค้นหา GPS ยังไม่มา ให้ค้นหาต่ออัตโนมัติทันทีที่ได้พิกัด
  useEffect(() => {
    if (!waitingForGps || !coords) return;
    setWaitingForGps(false);
    runSearch(coords, pendingFilters || {});
    setPendingFilters(null);
  }, [coords, pendingFilters, runSearch, waitingForGps]);

  // แสดงข้อผิดพลาดเมื่อผู้ใช้ปิดหรือไม่อนุญาต GPS
  useEffect(() => {
    if (!waitingForGps || !positionError) return;
    setWaitingForGps(false);
    setLoading(false);
    setError("ไม่สามารถใช้ตำแหน่งได้ กรุณาอนุญาต Location ในเบราว์เซอร์");
  }, [positionError, waitingForGps]);

  function handleSearch() {
    // ถ้ากดก่อน GPS พร้อม ให้จำ Filter แล้วรอ Effect เรียกค้นหาต่อ
    if (radius && !coords) {
      if (!isGeolocationAvailable || !isGeolocationEnabled) {
        setError("อุปกรณ์นี้ปิด GPS หรือไม่รองรับตำแหน่ง");
        return;
      }

      setLoading(true);
      setWaitingForGps(true);
      setError("");
      setPendingFilters({ type, radius, search });
      getPosition();
      return;
    }

    runSearch(coords);
  }

  function applyFilters(nextType, nextRadius) {
    // กด Chip แล้วค้นหาทันที ไม่ต้องรอกดปุ่มค้นหาอีกครั้ง
    setType(nextType);
    setRadius(nextRadius);

    if (nextRadius && !coords) {
      setLoading(true);
      setWaitingForGps(true);
      setPendingFilters({ type: nextType, radius: nextRadius, search });
      getPosition();
      return;
    }

    runSearch(coords, { type: nextType, radius: nextRadius, search });
  }

  return (
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
