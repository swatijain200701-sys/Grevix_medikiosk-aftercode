"use client";

import React from "react";

interface StepRegistrationProps {
  preferredName: string;
  setPreferredName: (val: string) => void;
  age: string;
  setAge: (val: string) => void;
  isAssisted: boolean;
  setIsAssisted: (val: boolean) => void;
  enteredBy: "self" | "caregiver" | "staff";
  setEnteredBy: (val: "self" | "caregiver" | "staff") => void;
  caregiverName: string;
  setCaregiverName: (val: string) => void;
  t: any;
}

export const StepRegistration: React.FC<StepRegistrationProps> = ({
  preferredName,
  setPreferredName,
  age,
  setAge,
  isAssisted,
  setIsAssisted,
  enteredBy,
  setEnteredBy,
  caregiverName,
  setCaregiverName,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#F1F6F8] tracking-tight">{t.nameLabel}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.kioskSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="patient-name-input" className="block text-sm font-semibold text-[#F1F6F8] mb-1.5">
            {t.nameLabel}
          </label>
          <input
            id="patient-name-input"
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full text-base sm:text-lg min-h-[48px] p-3.5 sm:p-4 rounded-xl border border-[#294350] focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3]"
          />
        </div>

        <div>
          <label htmlFor="patient-age-input" className="block text-sm font-semibold text-[#F1F6F8] mb-1.5">
            {t.ageLabel}
          </label>
          <input
            id="patient-age-input"
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={t.agePlaceholder}
            className="w-full text-base sm:text-lg min-h-[48px] p-3.5 sm:p-4 rounded-xl border border-[#294350] focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3]"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] cursor-pointer transition min-h-[48px]">
            <input
              type="checkbox"
              id="assisted-entry-checkbox"
              checked={isAssisted}
              onChange={(e) => {
                setIsAssisted(e.target.checked);
                if (!e.target.checked) setEnteredBy("self");
              }}
              className="w-5 h-5 accent-[#50D6C5] rounded-md"
            />
            <div className="text-sm">
              <span className="font-semibold text-[#F1F6F8]">{t.assistedEntry}</span>
              <p className="text-xs text-[#91A8B3] mt-0.5">
                Check if entered by a family member, caregiver, or hospital volunteer.
              </p>
            </div>
          </label>

          {isAssisted && (
            <div className="mt-3 pl-8 space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#B6C7CF] cursor-pointer min-h-[40px]">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="caregiver"
                    checked={enteredBy === "caregiver"}
                    onChange={() => setEnteredBy("caregiver")}
                    className="accent-[#50D6C5] w-4 h-4"
                  />
                  <span>Caregiver / Family</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#B6C7CF] cursor-pointer min-h-[40px]">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="staff"
                    checked={enteredBy === "staff"}
                    onChange={() => setEnteredBy("staff")}
                    className="accent-[#50D6C5] w-4 h-4"
                  />
                  <span>Hospital Staff / Volunteer</span>
                </label>
              </div>
              <input
                type="text"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                placeholder="Caregiver / Volunteer Name (Optional)"
                className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] focus:border-[#50D6C5] outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepRegistration;
