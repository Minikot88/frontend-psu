"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserSearch } from "lucide-react";

export default function OwnerPage() {
  const { form_new_id } = useParams();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!form_new_id) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/master/form-new-findings/${form_new_id}`)
      .then((res) => res.json())
      .then((json) => {
        const owner = json?.data?.owner;
        setOwners(Array.isArray(owner) ? owner : owner ? [owner] : []);
      })
      .finally(() => setLoading(false));
  }, [form_new_id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }
  if (owners.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <UserSearch className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-800">ไม่พบข้อมูลผู้เป็นเจ้าของผลงาน</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {owners.map((o, idx) => {
        const objectives = safeParse(o.objective);
        const periods = safeParse(o.period);

        return (
          <div key={idx} className="section-card p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0b3a75]">ข้อมูลเจ้าของผลงาน #{idx + 1}</h2>
                <p className="text-xs text-slate-500">รหัสฟอร์ม: {o.form_own_code || "-"}</p>
              </div>

              <span
                className={`chip border ${
                  o.form_own_status?.includes("อนุมัติ")
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                {o.form_own_status || "-"}
              </span>
            </div>

            <Section title="ข้อมูลผู้รับผิดชอบ">
              <InfoGrid>
                <Info label="ชื่อ-นามสกุล" value={o.fullname} />
                <Info label="สถานะความเป็นเจ้าของ" value={o.is_ownership_status} />
                <Info label="ประเภทเจ้าของผลงาน" value={o.form_own_ownertype} />
                <Info label="หน่วยงาน (หลัก)" value={o.form_own_department} />
              </InfoGrid>
            </Section>

            <Section title="ข้อมูลหน่วยงานร่วม">
              <InfoGrid>
                <Info label="หน่วยงาน" value={o.form_own_co_department} />
                <Info label="ตำแหน่ง" value={o.form_own_co_position} />
              </InfoGrid>
            </Section>

            <Section title="ข้อมูลติดต่อ">
              <InfoGrid>
                <Info label="โทรศัพท์" value={o.form_own_co_tel} />
                <Info label="Email" value={o.form_own_co_mail} />
              </InfoGrid>
            </Section>

            <Section title="ชื่อแบบฟอร์ม">
              <p className="text-sm leading-relaxed text-slate-700">{o.form_own_form_name || "-"}</p>
            </Section>

            {objectives.length > 0 && (
              <Section title="วัตถุประสงค์การใช้ประโยชน์">
                <div className="space-y-2">
                  {objectives.flat().map((item, i) => (
                    <div key={i} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {periods.length > 0 && (
              <Section title="ช่วงเวลาการดำเนินงาน">
                <div className="space-y-3">
                  {periods.map((row, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                      {row.map((r, j) => (
                        <div key={j}>{r}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="วันเวลาที่เกี่ยวข้อง">
              <InfoGrid>
                <Info label="วันที่ตรวจสอบ" value={formatDate(o.form_own_checked_date)} />
                <Info label="วันที่อนุมัติ" value={formatDate(o.form_own_date_approve)} />
                <Info label="วันที่สร้างข้อมูล" value={formatDate(o.form_own_created_at)} />
                <Info label="วันที่อัปเดตข้อมูล" value={formatDate(o.form_own_updated_at)} />
              </InfoGrid>
            </Section>
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
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "-"}</p>
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

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
