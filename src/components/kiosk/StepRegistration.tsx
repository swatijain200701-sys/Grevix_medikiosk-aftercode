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
        <h2 className="text-2xl font-extrabold text-[#17343A] tracking-tight">{t.nameLabel}</h2>
        <p className="text-[#52656B] text-sm mt-1">{t.kioskSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="patient-name-input" className="block text-sm font-semibold text-[#17343A] mb-1.5">
            {t.nameLabel}
          </label>
          <input
            id="patient-name-input"
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full text-base sm:text-lg p-3.5 sm:p-4 rounded-xl border border-[#DCE7E4] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition bg-white text-[#17343A]"
          />
        </div>

        <div>
          <label htmlFor="patient-age-input" className="block text-sm font-semibold text-[#17343A] mb-1.5">
            {t.ageLabel}
          </label>
          <input
            id="patient-age-input"
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={t.agePlaceholder}
            className="w-full text-base sm:text-lg p-3.5 sm:p-4 rounded-xl border border-[#DCE7E4] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition bg-white text-[#17343A]"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-[#DCE7E4] bg-[#F7FAF9] hover:bg-[#E8F3EF] cursor-pointer transition">
            <input
              type="checkbox"
              id="assisted-entry-checkbox"
              checked={isAssisted}
              onChange={(e) => {
                setIsAssisted(e.target.checked);
                if (!e.target.checked) setEnteredBy("self");
              }}
              className="w-5 h-5 accent-[#0F766E] rounded-md"
            />
            <div className="text-sm">
              <span className="font-semibold text-[#17343A]">{t.assistedEntry}</span>
              <p className="text-xs text-[#52656B]">
                Check if entered by a family member, caregiver, or hospital volunteer.
              </p>
            </div>
          </label>

          {isAssisted && (
            <div className="mt-3 pl-8 space-y-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#334155] cursor-pointer">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="caregiver"
                    checked={enteredBy === "caregiver"}
                    onChange={() => setEnteredBy("caregiver")}
                    className="accent-[#0F766E]"
                  />
                  Caregiver / Family
                </label>
                <label className="flex items-center gap-2 text-sm text-[#334155] cursor-pointer">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="staff"
                    checked={enteredBy === "staff"}
                    onChange={() => setEnteredBy("staff")}
                    className="accent-[#0F766E]"
                  />
                  Hospital Staff / Volunteer
                </label>
              </div>
              <input
                type="text"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                placeholder="Caregiver / Volunteer Name (Optional)"
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE7E4] bg-white text-[#17343A] focus:border-[#0F766E] outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepRegistration;
