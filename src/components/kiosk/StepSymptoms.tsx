'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface StepSymptomsProps {
  selectedSymptoms: string[];
  toggleSymptom: (s: string) => void;
  customSymptom: string;
  setCustomSymptom: (s: string) => void;
  addCustomSymptom: () => void;
  lang: 'en' | 'hi';
  t: any;
}

const COMMON_SYMPTOMS = [
  { id: 'fever', labelEn: 'Fever', labelHi: 'बुखार' },
  { id: 'cough', labelEn: 'Cough', labelHi: 'खांसी' },
  { id: 'headache', labelEn: 'Headache', labelHi: 'सिरदर्द' },
  { id: 'chest_pain', labelEn: 'Chest Pain / Pressure', labelHi: 'सीने में दर्द या भारीपन' },
  { id: 'short_breath', labelEn: 'Shortness of Breath', labelHi: 'सांस लेने में तकलीफ' },
  { id: 'body_ache', labelEn: 'Body Pain / Fatigue', labelHi: 'बदन दर्द / थकान' },
  { id: 'stomach_pain', labelEn: 'Stomach Pain', labelHi: 'पेट दर्द' },
  { id: 'vomiting', labelEn: 'Nausea / Vomiting', labelHi: 'उल्टी या मितली' },
  { id: 'dizziness', labelEn: 'Dizziness / Fainting', labelHi: 'चक्कर आना' },
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
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.symptomsTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.symptomsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {COMMON_SYMPTOMS.map(s => {
          const isSelected = selectedSymptoms.includes(s.labelEn);
          return (
            <button
              key={s.id}
              type="button"
              id={`symptom-${s.id}`}
              onClick={() => toggleSymptom(s.labelEn)}
              className={`p-3.5 rounded-xl border-2 text-left font-medium text-sm flex items-center justify-between transition ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-semibold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{lang === 'hi' ? s.labelHi : s.labelEn}</span>
              {isSelected && <Check className="w-4 h-4 text-teal-700" />}
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex gap-2">
        <input
          type="text"
          value={customSymptom}
          onChange={e => setCustomSymptom(e.target.value)}
          placeholder={lang === 'hi' ? 'अन्य कोई लक्षण जोड़ें...' : 'Add other symptoms...'}
          className="flex-1 text-sm p-3 rounded-xl border border-slate-200 bg-white"
        />
        <button
          type="button"
          onClick={addCustomSymptom}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition"
        >
          Add
        </button>
      </div>
    </div>
  );
};