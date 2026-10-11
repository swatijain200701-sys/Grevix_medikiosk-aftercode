"use client";

import React, { useState } from "react";
import { Shield, Check, Info, ArrowRight, UserCheck } from "lucide-react";

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
  const [showAbhaPreview, setShowAbhaPreview] = useState(false);
  const [abhaApplied, setAbhaApplied] = useState(false);

  const handleApplySyntheticAbha = () => {
    setPreferredName("Ramesh Kumar");
    setAge("54");
    setAbhaApplied(true);
    setShowAbhaPreview(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#F1F6F8] tracking-tight">{t.nameLabel}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.kioskSubtitle}</p>
      </div>

      {/* OPTIONAL ABHA FLOW CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#18303D] border border-[#294350] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#50D6C5]" />
            <h3 className="font-bold text-sm text-[#F1F6F8]">
              ABHA / Ayushman Bharat Health Account (Optional)
            </h3>
          </div>
          <span className="text-3xs font-mono px-2.5 py-0.5 rounded-full bg-[#122330] text-[#91A8B3] border border-[#294350]">
            ABHA connection — not configured
          </span>
        </div>

        <p className="text-xs text-[#B6C7CF] leading-relaxed">
          The intended benefit of ABHA is reducing repeated demographic entry (name, age, gender) at OPD counters. It does not grant permission to view or retrieve medical records without explicit, separate consent. Patients can continue registration normally.
        </p>

        {abhaApplied ? (
          <div className="p-3 rounded-xl bg-[#50D6C5]/10 border border-[#50D6C5]/30 text-xs text-[#50D6C5] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Synthetic demo demographics confirmed (Ramesh Kumar, 54 Y). You may adjust fields below.</span>
            </span>
            <button
              type="button"
              onClick={() => setAbhaApplied(false)}
              className="text-3xs underline text-[#91A8B3] hover:text-[#F1F6F8]"
            >
              Reset
            </button>
          </div>
        ) : !showAbhaPreview ? (
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              id="preview-synthetic-abha-btn"
              onClick={() => setShowAbhaPreview(true)}
              className="px-3.5 py-2 rounded-xl border border-[#294350] bg-[#122330] hover:bg-[#203D4D] text-xs font-semibold text-[#50D6C5] transition min-h-[40px]"
            >
              Preview Synthetic ABHA Import
            </button>
            <span className="text-3xs text-[#91A8B3]">
              • Or continue typing details manually below (works offline)
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#122330] border border-[#294350] space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#294350] pb-2">
              <span className="font-bold text-[#F1F6F8]">
                Synthetic Demonstration Preview (Permitted test identity only)
              </span>
              <span className="text-3xs font-mono text-[#50D6C5]">ABDM M1 Prototype</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-3xs text-[#B6C7CF]">
              <div><strong>Name:</strong> Ramesh Kumar</div>
              <div><strong>Age / Gender:</strong> 54 Y / Male</div>
              <div><strong>ABHA Address:</strong> ramesh.kumar@abdm</div>
              <div><strong>Synthetic Token:</strong> SBX-DEMO-9182</div>
            </div>

            <p className="text-3xs text-[#91A8B3] italic">
              * Real ABHA numbers and OTP verification are not collected or simulated. Please confirm before applying these details to your intake form.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                id="confirm-synthetic-abha-btn"
                onClick={handleApplySyntheticAbha}
                className="px-4 py-2 rounded-lg bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] font-bold text-xs transition"
              >
                Confirm & Apply Details
              </button>
              <button
                type="button"
                onClick={() => setShowAbhaPreview(false)}
                className="px-3 py-2 rounded-lg border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-xs text-[#B6C7CF] transition"
              >
                Continue Without ABHA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MANUAL DEMOGRAPHIC INPUTS */}
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
