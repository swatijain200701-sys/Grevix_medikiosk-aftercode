"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepConditionsMedsProps {
  selectedConditions: string[];
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  medicines: string;
  setMedicines: (m: string) => void;
  lang: "en" | "hi";
  t: any;
}

const COMMON_CONDITIONS = [
  { id: "diabetes", labelEn: "Diabetes (Sugar)", labelHi: "मधुमेह (Diabetes / Sugar)" },
  { id: "hypertension", labelEn: "High Blood Pressure (BP)", labelHi: "उच्च रक्तचाप (High Blood Pressure / BP)" },
  { id: "asthma", labelEn: "Asthma / Respiratory", labelHi: "दमा / सांस की बीमारी (Asthma)" },
  { id: "heart", labelEn: "Heart Condition", labelHi: "हृदय रोग (Heart Condition)" },
  { id: "thyroid", labelEn: "Thyroid", labelHi: "थायराइड (Thyroid)" },
  { id: "none", labelEn: "None reported", labelHi: "कोई बीमारी नहीं (None reported)" },
  { id: "unknown", labelEn: "Unknown / Not sure", labelHi: "अज्ञात / निश्चित नहीं (Unknown)" },
];

export const StepConditionsMeds: React.FC<StepConditionsMedsProps> = ({
  selectedConditions,
  setSelectedConditions,
  medicines,
  setMedicines,
  lang,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F1F6F8] tracking-tight">{t.conditionsTitle}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.conditionsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COMMON_CONDITIONS.map((c) => {
          const isSelected = selectedConditions.includes(c.labelEn);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (c.id === "none" || c.id === "unknown") {
                  setSelectedConditions([c.labelEn]);
                } else {
                  setSelectedConditions((prev) => {
                    const filtered = prev.filter((x) => x !== "None reported" && x !== "Unknown / Not sure");
                    return filtered.includes(c.labelEn)
                      ? filtered.filter((x) => x !== c.labelEn)
                      : [...filtered, c.labelEn];
                  });
                }
              }}
              className={`p-4 rounded-xl border-2 text-left font-medium text-sm flex items-center justify-between transition min-h-[52px] ${
                isSelected
                  ? "border-[#50D6C5] bg-[#50D6C5]/15 text-[#F1F6F8] font-bold shadow-sm"
                  : "border-[#294350] bg-[#18303D] text-[#B6C7CF] hover:border-[#50D6C5]/40"
              }`}
            >
              <span>{lang === "hi" ? c.labelHi : c.labelEn}</span>
              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-[#50D6C5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#062820] stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#294350] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#294350]">
        <h3 className="text-lg font-bold text-[#F1F6F8]">{t.medicinesTitle}</h3>
        <p className="text-[#91A8B3] text-xs mt-0.5 mb-3">{t.medicinesSubtitle}</p>
        <textarea
          id="medicines-input"
          rows={3}
          value={medicines}
          onChange={(e) => setMedicines(e.target.value)}
          placeholder={
            lang === "hi"
              ? "उदा. मेटफॉर्मिन 500mg, बीपी की गोली"
              : "e.g. Metformin 500mg BD, Amlodipine 5mg OD"
          }
          className="w-full text-base p-4 rounded-xl border border-[#294350] focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3]"
        />
        <div className="flex gap-2.5 mt-2.5">
          <button
            type="button"
            onClick={() => setMedicines("None reported (No regular medicines)")}
            className="px-4 py-2.5 rounded-lg border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] hover:border-[#50D6C5]/40 text-xs font-semibold text-[#F1F6F8] min-h-[40px]"
          >
            None reported
          </button>
          <button
            type="button"
            onClick={() => setMedicines("Unknown / Patient cannot recall")}
            className="px-4 py-2.5 rounded-lg border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] hover:border-[#50D6C5]/40 text-xs font-semibold text-[#F1F6F8] min-h-[40px]"
          >
            Unknown / Not sure
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepConditionsMeds;
