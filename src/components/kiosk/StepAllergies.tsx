"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepAllergiesProps {
  allergyType: "none_reported" | "unknown" | "reported";
  setAllergyType: (val: "none_reported" | "unknown" | "reported") => void;
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
        <h2 className="text-2xl font-bold text-[#F1F6F8] tracking-tight">{t.allergiesTitle}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.allergiesSubtitle}</p>
      </div>

      <div className="space-y-3">
        {[
          { id: "none_reported", label: t.allergyNone, desc: "Patient reports no known allergic reactions" },
          { id: "unknown", label: t.allergyUnknown, desc: "Allergy history is uncertain or unverified" },
          { id: "reported", label: t.allergyReported, desc: "Has had allergic reaction to medicine, food, or injection" },
        ].map((a) => {
          const isSelected = allergyType === a.id;
          return (
            <button
              key={a.id}
              type="button"
              id={`allergy-opt-${a.id}`}
              onClick={() => setAllergyType(a.id as any)}
              className={`w-full p-4 rounded-xl border-2 text-left transition flex items-start justify-between min-h-[56px] ${
                isSelected
                  ? "border-[#50D6C5] bg-[#50D6C5]/15 text-[#F1F6F8] font-bold shadow-sm"
                  : "border-[#294350] bg-[#18303D] text-[#B6C7CF] hover:border-[#50D6C5]/40"
              }`}
            >
              <div>
                <div className="font-semibold text-sm text-[#F1F6F8]">{a.label}</div>
                <div className="text-xs text-[#91A8B3] mt-0.5">{a.desc}</div>
              </div>
              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-[#50D6C5] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-[#062820] stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#294350] shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}

        {allergyType === "reported" && (
          <div className="mt-3 space-y-1.5">
            <label className="block text-xs font-semibold text-[#F1F6F8]">
              Allergy Details (Medication or Allergen Name):
            </label>
            <input
              type="text"
              id="allergy-details-input"
              value={allergyDetails}
              onChange={(e) => setAllergyDetails(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
              className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] focus:border-[#50D6C5] outline-none"
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#294350] space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#F1F6F8] mb-1.5">Previous Medical Care:</label>
          <input
            type="text"
            value={previousCare}
            onChange={(e) => setPreviousCare(e.target.value)}
            placeholder="e.g. Visited local clinic last month, surgery 2 years ago"
            className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] focus:border-[#50D6C5] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#F1F6F8] mb-1.5">Questions for Doctor:</label>
          <input
            type="text"
            value={questionsForDoctor}
            onChange={(e) => setQuestionsForDoctor(e.target.value)}
            placeholder="e.g. Should I continue current medications?"
            className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] focus:border-[#50D6C5] outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default StepAllergies;
