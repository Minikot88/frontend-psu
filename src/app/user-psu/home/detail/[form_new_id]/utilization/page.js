"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FileSearch2 } from "lucide-react";

export default function UtilizationPage() {
  const { form_new_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/master/form-new-findings/${form_new_id}`)
      .then((res) => res.json())
      .then((json) => setItems(json.data.utilization || []))
      .finally(() => setLoading(false));
  }, [form_new_id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <FileSearch2 className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-800">ไม่พบข้อมูลการใช้ประโยชน์</p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          ยังไม่มีข้อมูลในส่วนการใช้ประโยชน์สำหรับรายการนี้
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((u, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#0b3a75]">ข้อมูลการใช้ประโยชน์ #{idx + 1}</h2>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {Object.entries(u).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="text-xs text-slate-500">{key}</p>
                <p className="font-medium text-slate-800">{value === null ? "-" : String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
