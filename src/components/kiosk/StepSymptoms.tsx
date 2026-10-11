"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepSymptomsProps {
  selectedSymptoms: string[];
  toggleSymptom: (s: string) => void;
  customSymptom: string;
  setCustomSymptom: (s: string) => void;
  addCustomSymptom: () => void;
  lang: "en" | "hi";
  t: any;
}

const COMMON_SYMPTOMS = [
  { id: "fever", labelEn: "Fever", labelHi: "बुखार (Fever)" },
  { id: "cough", labelEn: "Cough", labelHi: "खांसी (Cough)" },
  { id: "headache", labelEn: "Headache", labelHi: "सिरदर्द (Headache)" },
  { id: "chest_pain", labelEn: "Chest Pain / Pressure", labelHi: "छाती में दर्द या दबाव (Chest Pain)" },
  { id: "short_breath", labelEn: "Shortness of Breath", labelHi: "साँस लेने में तकलीफ़ (Breathlessness)" },
  { id: "body_ache", labelEn: "Body Pain / Fatigue", labelHi: "शरीर में दर्द व थकान (Body Pain)" },
  { id: "stomach_pain", labelEn: "Stomach Pain", labelHi: "पेट दर्द (Stomach Pain)" },
  { id: "vomiting", labelEn: "Nausea / Vomiting", labelHi: "उल्टी या मिचली (Nausea)" },
  { id: "dizziness", labelEn: "Dizziness / Fainting", labelHi: "चक्कर आना (Dizziness)" },
];

export const StepSymptoms: React.FC<StepSymptomsProps> = ({
  selectedSymptoms,
  toggleSymptom,
  customSymptom,
  setCustomSymptom,
  addCustomSymptom,
  lang,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#293D36] tracking-tight">{t.symptomsTitle}</h2>
        <p className="text-[#53665D] text-sm mt-1">{t.symptomsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COMMON_SYMPTOMS.map((s) => {
          const isSelected = selectedSymptoms.includes(s.labelEn);
          return (
            <button
              key={s.id}
              type="button"
              id={`symptom-${s.id}`}
              onClick={() => toggleSymptom(s.labelEn)}
              className={`p-4 rounded-xl border-2 text-left font-medium text-sm flex items-center justify-between transition min-h-[52px] ${
                isSelected
                  ? "border-[#356B62] bg-[#D8E5DC] text-[#293D36] font-bold shadow-sm"
                  : "border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36] hover:border-[#356B62]/50 hover:bg-[#D8E5DC]/30"
              }`}
            >
              <span>{lang === "hi" ? s.labelHi : s.labelEn}</span>
              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-[#356B62] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#FFFDF7] stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#B8C9BD] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex gap-2">
        <input
          type="text"
          value={customSymptom}
          onChange={(e) => setCustomSymptom(e.target.value)}
          placeholder={lang === "hi" ? "अन्य कोई लक्षण लिखें..." : "Add other symptoms..."}
          className="flex-1 text-sm min-h-[48px] p-3 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36] placeholder-[#53665D] focus:border-[#356B62] outline-none"
        />
        <button
          type="button"
          onClick={addCustomSymptom}
          className="px-5 py-3 bg-[#356B62] text-[#FFFDF7] rounded-xl text-sm font-bold hover:bg-[#2B574F] transition min-h-[48px]"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default StepSymptoms;