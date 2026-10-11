'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface StepConditionsMedsProps {
  selectedConditions: string[];
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  medicines: string;
  setMedicines: (m: string) => void;
  lang: 'en' | 'hi';
  t: any;
}

const COMMON_CONDITIONS = [
  { id: 'diabetes', labelEn: 'Diabetes (Sugar)', labelHi: 'मधुमेह (शुगर)' },
  { id: 'hypertension', labelEn: 'High Blood Pressure (BP)', labelHi: 'उच्च रक्तचाप (बीपी)' },
  { id: 'asthma', labelEn: 'Asthma / Respiratory', labelHi: 'अस्थमा / दमा' },
  { id: 'heart', labelEn: 'Heart Condition', labelHi: 'हृदय रोग' },
  { id: 'thyroid', labelEn: 'Thyroid', labelHi: 'थायराइड' },
  { id: 'none', labelEn: 'None reported', labelHi: 'कोई बीमारी नहीं है' },
  { id: 'unknown', labelEn: 'Unknown / Not sure', labelHi: 'जानकारी नहीं है' },
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
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.conditionsTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.conditionsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {COMMON_CONDITIONS.map(c => {
          const isSelected = selectedConditions.includes(c.labelEn);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (c.id === 'none' || c.id === 'unknown') {
                  setSelectedConditions([c.labelEn]);
                } else {
                  setSelectedConditions(prev => {
                    const filtered = prev.filter(x => x !== 'None reported' && x !== 'Unknown / Not sure');
                    return filtered.includes(c.labelEn)
                      ? filtered.filter(x => x !== c.labelEn)
                      : [...filtered, c.labelEn];
                  });
                }
              }}
              className={`p-3.5 rounded-xl border-2 text-left font-medium text-sm flex items-center justify-between transition ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-semibold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{lang === 'hi' ? c.labelHi : c.labelEn}</span>
              {isSelected && <Check className="w-4 h-4 text-teal-700" />}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-lg font-bold text-[#0B1D3A]">{t.medicinesTitle}</h3>
        <p className="text-slate-600 text-xs mt-0.5 mb-3">{t.medicinesSubtitle}</p>
        <textarea
          id="medicines-input"
          rows={3}
          value={medicines}
          onChange={e => setMedicines(e.target.value)}
          placeholder={lang === 'hi' ? 'उदा. मेटफॉर्मिन 500mg, बीपी की गोली' : 'e.g. Metformin 500mg BD, Amlodipine 5mg OD'}
          className="w-full text-base p-3.5 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-hidden transition bg-white"
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setMedicines('None reported (No regular medicines)')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700"
          >
            None
          </button>
          <button
            type="button"
            onClick={() => setMedicines('Unknown / Patient cannot recall')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700"
          >
            Unknown
          </button>
        </div>
      </div>
    </div>
  );
};