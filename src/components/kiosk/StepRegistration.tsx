'use client';
import React from 'react';

interface StepRegistrationProps {
  preferredName: string;
  setPreferredName: (val: string) => void;
  age: string;
  setAge: (val: string) => void;
  isAssisted: boolean;
  setIsAssisted: (val: boolean) => void;
  enteredBy: 'self' | 'caregiver' | 'staff';
  setEnteredBy: (val: 'self' | 'caregiver' | 'staff') => void;
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
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.nameLabel}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.kioskSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.nameLabel}</label>
          <input
            id="patient-name-input"
            type="text"
            value={preferredName}
            onChange={e => setPreferredName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full text-lg p-4 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-hidden transition bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.ageLabel}</label>
          <input
            id="patient-age-input"
            type="text"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder={t.agePlaceholder}
            className="w-full text-lg p-4 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-hidden transition bg-white"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer transition">
            <input
              type="checkbox"
              id="assisted-entry-checkbox"
              checked={isAssisted}
              onChange={e => {
                setIsAssisted(e.target.checked);
                if (!e.target.checked) setEnteredBy('self');
              }}
              className="w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
            <div className="text-sm">
              <span className="font-semibold text-slate-800">{t.assistedEntry}</span>
              <p className="text-xs text-slate-500">Check if entered by a family member, caregiver, or hospital volunteer.</p>
            </div>
          </label>

          {isAssisted && (
            <div className="mt-3 pl-8 space-y-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="caregiver"
                    checked={enteredBy === 'caregiver'}
                    onChange={() => setEnteredBy('caregiver')}
                  />
                  Caregiver / Family
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="enteredBy"
                    value="staff"
                    checked={enteredBy === 'staff'}
                    onChange={() => setEnteredBy('staff')}
                  />
                  Hospital Staff / Volunteer
                </label>
              </div>
              <input
                type="text"
                value={caregiverName}
                onChange={e => setCaregiverName(e.target.value)}
                placeholder="Caregiver / Volunteer Name (Optional)"
                className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};