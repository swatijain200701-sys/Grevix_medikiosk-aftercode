"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepAllergiesProps {
  allergyType: "none_reported" | "unknown" | "reported" | "unanswered" | "";
  setAllergyType: (val: "none_reported" | "unknown" | "reported" | "unanswered" | "") => void;
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
  const options = [
    {
      id: "none_reported",
      label: t.allergyNone || "No known allergies",
      desc: "No previous adverse reactions to medications, injections, or food",
    },
    {
      id: "reported",
      label: t.allergyReported || "I have an allergy",
      desc: "Has had allergic reaction to medicine, food, or injection",
    },
    {
      id: "unknown",
      label: t.allergyUnknown || "I do not know",
      desc: "Allergy history is uncertain, untested, or unverified",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">{t.allergiesTitle}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t.allergiesSubtitle}</p>
      </div>

      <div className="space-y-3">
        {options.map((a) => {
          const isSelected = allergyType === a.id;
          return (
            <button
              key={a.id}
              type="button"
              id={`allergy-opt-${a.id}`}
              onClick={() => setAllergyType(a.id as any)}
              className={`w-full p-4 rounded-xl border-2 text-left transition flex items-start justify-between min-h-[56px] ${
                isSelected
                  ? "border-[#356B62] bg-[var(--bg-panel)] text-[var(--text-heading)] font-bold shadow-sm"
                  : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)] hover:border-[var(--btn-main)]/50"
              }`}
            >
              <div>
                <div className="font-bold text-sm text-[var(--text-heading)]">{a.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{a.desc}</div>
              </div>
              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-[var(--btn-main)] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-[var(--btn-main-text)] stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[var(--border-color)] shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}

        {allergyType === "reported" && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--bg-panel)]/50 border border-[var(--border-color)] space-y-2">
            <label htmlFor="allergy-details-input" className="block text-xs font-bold text-[var(--text-heading)]">
              Allergy Details (Medication, Food, or Allergen Name):
            </label>
            <input
              type="text"
              id="allergy-details-input"
              value={allergyDetails}
              onChange={(e) => setAllergyDetails(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Iodine contrast"
              className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-[#53665D] focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none"
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
        <div>
          <label className="block text-sm font-bold text-[var(--text-heading)] mb-1.5">
            Previous Medical Care (Optional):
          </label>
          <input
            type="text"
            value={previousCare}
            onChange={(e) => setPreviousCare(e.target.value)}
            placeholder="e.g. Visited local clinic last month, surgery 2 years ago"
            className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-[#53665D] focus:border-[#356B62] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--text-heading)] mb-1.5">
            Questions for Doctor (Optional):
          </label>
          <input
            type="text"
            value={questionsForDoctor}
            onChange={(e) => setQuestionsForDoctor(e.target.value)}
            placeholder="e.g. Should I continue my current morning tablet?"
            className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-[#53665D] focus:border-[#356B62] outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default StepAllergies;