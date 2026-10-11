'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface StepAllergiesProps {
  allergyType: 'none_reported' | 'unknown' | 'reported';
  setAllergyType: (val: 'none_reported' | 'unknown' | 'reported') => void;
  allergyDetails: string;
  setAllergyDetails: (val: string) => void;
  previousCare: string;
  setPreviousCare: (val: string) => void;
  questionsForDoctor: string;
  setQuestionsForDoctor: (val: string) => void;
  t: any;
}

export const StepAllergies: React.FC<StepAllergiesProps> = ({
  allergyType,
  setAllergyType,
  allergyDetails,
  setAllergyDetails,
  previousCare,
  setPreviousCare,
  questionsForDoctor,
  setQuestionsForDoctor,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.allergiesTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.allergiesSubtitle}</p>
      </div>

      <div className="space-y-3">
        {[
          { id: 'none_reported', label: t.allergyNone, desc: 'Patient reports no known allergic reactions' },
          { id: 'unknown', label: t.allergyUnknown, desc: 'Allergy history is uncertain or unverified' },
          { id: 'reported', label: t.allergyReported, desc: 'Has had allergic reaction to medicine, food, or injection' },
        ].map(a => (
          <button
            key={a.id}
            type="button"
            id={`allergy-opt-${a.id}`}
            onClick={() => setAllergyType(a.id as any)}
            className={`w-full p-4 rounded-xl border-2 text-left transition flex items-start justify-between ${
              allergyType === a.id
                ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="font-semibold text-sm">{a.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
            </div>
            {allergyType === a.id && <Check className="w-5 h-5 text-teal-700 shrink-0" />}
          </button>
        ))}

        {allergyType === 'reported' && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Allergy Details (Medication or Allergen Name):
            </label>
            <input
              type="text"
              id="allergy-details-input"
              value={allergyDetails}
              onChange={e => setAllergyDetails(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">Previous Medical Care:</label>
          <input
            type="text"
            value={previousCare}
            onChange={e => setPreviousCare(e.target.value)}
            placeholder="e.g. Visited local clinic last month, surgery 2 years ago"
            className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">Questions for Doctor:</label>
          <input
            type="text"
            value={questionsForDoctor}
            onChange={e => setQuestionsForDoctor(e.target.value)}
            placeholder="e.g. Should I continue current medications?"
            className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>
  );
};