"use client";

import React, { useState } from "react";
import { User, Shield, Check, UserCheck, AlertCircle } from "lucide-react";

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
  const [showAbhaPreview, setShowAbhaPreview] = useState<boolean>(false);
  const [abhaApplied, setAbhaApplied] = useState<boolean>(false);

  const handleApplySyntheticAbha = () => {
    setPreferredName("Ramesh Kumar");
    setAge("54");
    setAbhaApplied(true);
    setShowAbhaPreview(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#293D36] tracking-tight">{t.kioskTitle}</h2>
        <p className="text-[#53665D] text-sm mt-1">{t.kioskSubtitle}</p>
      </div>

      {/* Public testing notice */}
      <div className="p-3 rounded-xl bg-[#D8E5DC] border border-[#B8C9BD] text-xs text-[#293D36] flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-[#356B62] shrink-0" />
        <span>Public testing version — please use fictional information.</span>
      </div>

      {/* SYNTHETIC DEMONSTRATION ABHA PANEL */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#D8E5DC] border border-[#B8C9BD] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#356B62]" />
            <h3 className="font-bold text-sm text-[#293D36]">
              ABHA / Ayushman Bharat Health Account (Optional)
            </h3>
          </div>
          <span className="text-3xs font-mono px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#53665D] border border-[#B8C9BD]">
            ABHA connection - not configured
          </span>
        </div>

        <p className="text-xs text-[#53665D] leading-relaxed">
          The intended benefit of ABHA is reducing repeated demographic entry (name, age, gender) at OPD counters. It does not grant permission to view or retrieve medical records without explicit, separate consent. Patients can continue registration normally.
        </p>

        {abhaApplied ? (
          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#356B62]/40 text-xs text-[#293D36] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#356B62]" />
              <span>Synthetic demo demographics applied (Ramesh Kumar, 54 Y). You may adjust fields below.</span>
            </span>
            <button
              type="button"
              onClick={() => setAbhaApplied(false)}
              className="text-3xs underline text-[#53665D] hover:text-[#293D36]"
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
              className="px-3.5 py-2 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] hover:bg-[#D8E5DC] text-xs font-bold text-[#356B62] transition min-h-[40px]"
            >
              Preview Synthetic ABHA Import
            </button>
            <span className="text-3xs text-[#53665D]">
              Or continue typing details manually below (works offline)
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#B8C9BD] space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#B8C9BD] pb-2">
              <span className="font-bold text-[#293D36]">
                Synthetic Demonstration Preview (Permitted test identity only)
              </span>
              <span className="text-3xs font-mono text-[#356B62] font-semibold">ABDM M1 Prototype</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-3xs text-[#293D36]">
              <div><strong>Name:</strong> Ramesh Kumar</div>
              <div><strong>Age / Gender:</strong> 54 Y / Male</div>
              <div><strong>ABHA Address:</strong> ramesh.kumar@abdm</div>
              <div><strong>Synthetic Token:</strong> SBX-DEMO-9182</div>
            </div>

            <p className="text-3xs text-[#53665D] italic">
              * Real ABHA numbers and OTP verification are not collected or simulated. Please confirm before applying these details to your intake form.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                id="confirm-synthetic-abha-btn"
                onClick={handleApplySyntheticAbha}
                className="px-4 py-2 rounded-lg bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-xs transition"
              >
                Confirm & Apply Details
              </button>
              <button
                type="button"
                onClick={() => setShowAbhaPreview(false)}
                className="px-3 py-2 rounded-lg border border-[#B8C9BD] bg-[#FAF7F0] hover:bg-[#D8E5DC] text-xs text-[#293D36] transition"
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
          <label htmlFor="patient-name-input" className="block text-sm font-bold text-[#293D36] mb-1.5">
            {t.nameLabel} <span className="text-red-600">*</span>
          </label>
          <input
            id="patient-name-input"
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full text-base min-h-[48px] p-3.5 rounded-xl border border-[#B8C9BD] focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none transition bg-[#FAF7F0] text-[#293D36] placeholder-[#53665D]"
          />
        </div>

        <div>
          <label htmlFor="patient-age-input" className="block text-sm font-bold text-[#293D36] mb-1.5">
            {t.ageLabel} <span className="text-red-600">*</span>
          </label>
          <input
            id="patient-age-input"
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={t.agePlaceholder}
            className="w-full text-base min-h-[48px] p-3.5 rounded-xl border border-[#B8C9BD] focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none transition bg-[#FAF7F0] text-[#293D36] placeholder-[#53665D]"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] hover:bg-[#D8E5DC] cursor-pointer transition min-h-[48px]">
            <input
              type="checkbox"
              id="assisted-entry-checkbox"
              checked={isAssisted}
              onChange={(e) => {
                setIsAssisted(e.target.checked);
                if (!e.target.checked) setEnteredBy("self");
              }}
              className="w-5 h-5 accent-[#356B62] rounded-md"
            />
            <div className="text-sm">
              <span className="font-bold text-[#293D36]">{t.assistedEntry}</span>
              <p className="text-xs text-[#53665D] mt-0.5">
                Check if entered by a family member, caregiver, or hospital volunteer.
              </p>
            </div>
          </label>

          {isAssisted && (
            <div className="mt-3 pl-8 space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#293D36] cursor-pointer min-h-[40px]">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="caregiver"
                    checked={enteredBy === "caregiver"}
                    onChange={() => setEnteredBy("caregiver")}
                    className="accent-[#356B62] w-4 h-4"
                  />
                  <span>Caregiver / Family</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#293D36] cursor-pointer min-h-[40px]">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="staff"
                    checked={enteredBy === "staff"}
                    onChange={() => setEnteredBy("staff")}
                    className="accent-[#356B62] w-4 h-4"
                  />
                  <span>Hospital Staff / Volunteer</span>
                </label>
              </div>
              <input
                type="text"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                placeholder="Caregiver / Volunteer Name (Optional)"
                className="w-full text-sm min-h-[48px] p-3 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36] placeholder-[#53665D] focus:border-[#356B62] outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepRegistration;