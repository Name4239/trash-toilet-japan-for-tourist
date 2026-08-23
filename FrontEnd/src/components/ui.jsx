import { Eye, EyeOff, LoaderCircle } from "lucide-react"; // UI พื้นฐานที่หลายหน้าใช้ซ้ำ เช่น Button, Field, Chip และ Loader | รวมไว้ที่นี่เพื่อให้หน้าตาของทั้งระบบตรงกัน
import { useState } from "react"; // นำ Dependency หรือ Module ที่บรรทัดถัดไปต้องใช้เข้ามาในไฟล์

export function Button({ children, variant = "primary", className = "", ...props }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const styles = { // variant เลือกชุดสี ส่วน props ส่งต่อ disabled/onClick/type ให้ button จริง
    primary: "bg-brand text-white hover:bg-brand-dark",
    success: "bg-leaf text-white hover:bg-green-700",
    danger: "bg-danger text-white hover:bg-red-600",
    outline: "border border-cream-200 bg-white text-ink hover:bg-cream-50",
    ghost: "text-brand hover:bg-orange-50",
  };

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, error, className = "", type = "text", ...props }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  const [showPassword, setShowPassword] = useState(false); // State นี้ใช้เฉพาะช่อง password เพื่อสลับซ่อน/แสดงข้อความ
  const isPassword = type === "password"; // ประกาศค่าที่ใช้ภายในขอบเขตนี้และไม่อนุญาตให้เปลี่ยนตัวแปรไปอ้างค่าใหม่

  return ( // ส่งผลลัพธ์ออกจากฟังก์ชันและหยุดทำบรรทัดถัดไปในฟังก์ชันนี้
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm text-stone-600">{label}</span>
      <span className="relative block">
        <input
          className={`w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-orange-100 ${isPassword ? "pr-12" : ""}`}
          type={isPassword && showPassword ? "text" : type}
          {...props}
        />
        {/* ช่องทั่วไปไม่มีปุ่มรูปตา ปุ่มนี้สร้างเฉพาะ password */}
        {isPassword && (
          <button
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-stone-400 transition hover:text-brand"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return ( // Textarea ใช้กับข้อความหลายบรรทัด เช่นรายละเอียด Place/Report
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm text-stone-600">{label}</span>
      <textarea
        className="min-h-28 w-full resize-none rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-orange-100"
        {...props}
      />
    </label>
  );
}

export function Chip({ active, children, ...props }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return ( // active=true ใช้สีส้มเพื่อบอกตัวเลือกที่ถูกเลือก
    <button
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-orange-200 bg-orange-100 font-semibold text-brand-dark"
          : "border-cream-200 bg-white text-stone-600"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageLoader() { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return ( // ใช้ระหว่างรอ API ก่อนมีข้อมูลจริงมาแสดง
    <div className="grid min-h-64 place-items-center">
      <LoaderCircle className="animate-spin text-brand" size={32} />
    </div>
  );
}

export function EmptyState({ title, description }) { // ประกาศฟังก์ชันนี้และกำหนดขอบเขตงานตามชื่อของฟังก์ชัน
  return ( // ใช้แทนพื้นที่รายการเมื่อ API คืน Array ว่าง
    <div className="rounded-2xl border border-dashed border-cream-200 bg-white/70 p-8 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
    </div>
  );
}
