"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

export default function PlanPage() {
  const { form_new_id } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/master/form-new-findings/${form_new_id}`)
      .then((res) => res.json())
      .then((json) => setPlans(json?.data?.plan || []))
      .finally(() => setLoading(false));
  }, [form_new_id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }
  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <ClipboardList className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-800">ไม่พบข้อมูลแผนการดำเนินงาน</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {plans.map((p, idx) => {
        const objectives = safeParse(p.objective);
        const periods = safeParse(p.period);

        return (
          <div key={idx} className="section-card p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0b3a75]">แผนการดำเนินงาน #{idx + 1}</h2>
                <p className="text-xs text-slate-500">รหัสแผน: {p.form_plan_code || "-"}</p>
              </div>

              <span
                className={`chip border ${
                  p.form_plan_status?.includes("อนุมัติ")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                {p.form_plan_status || "-"}
              </span>
            </div>

            <Section title="ข้อมูลผู้จัดทำแผน">
              <InfoGrid>
                <Info label="ชื่อ-นามสกุล" value={p.fullname} />
                <Info label="ตำแหน่ง" value={p.form_plan_position} />
                <Info label="หน่วยงาน" value={p.form_plan_department} />
                <Info label="อีเมล" value={p.form_plan_email} />
                <Info label="โทรศัพท์" value={p.form_plan_tel} />
              </InfoGrid>
            </Section>

            <Section title="รายละเอียดแผนงาน">
              <InfoGrid>
                <Info label="ประเภทแผนงาน" value={p.form_plan_type_status} />
                <Info label="ระยะเวลาดำเนินงาน" value={`${p.form_plan_period ?? "-"} เดือน`} />
                <Info
                  label="มูลค่าการใช้ประโยชน์"
                  value={`${Number(p.form_plan_usage_value || 0).toLocaleString()} บาท`}
                />
                <Info label="กลุ่มเป้าหมาย" value={p.form_plan_target} />
                <Info label="ผลลัพธ์ที่คาดหวัง" value={p.form_plan_result} />
              </InfoGrid>
            </Section>

            {objectives.length > 0 && (
              <Section title="วัตถุประสงค์การใช้ประโยชน์">
                <div className="space-y-2">
                  {objectives.flat().map((o, i) => (
                    <div key={i} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-700">
                      {o}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {periods.length > 0 && (
              <Section title="ช่วงเวลาการดำเนินงาน">
                <div className="space-y-3">
                  {periods.map((row, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {row.map((r, j) => (
                        <div key={j}>{r}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-800">{value || "-"}</div>
    </div>
  );
}

function safeParse(str) {
  try {
    if (!str) return [];
    return JSON.parse(str);
  } catch {
    return [];
  }
}
