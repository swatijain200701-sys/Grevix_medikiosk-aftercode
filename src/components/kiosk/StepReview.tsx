'use client';
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { DocumentRecord } from '@/lib/types/schema';

interface StepReviewProps {
  preferredName: string;
  age: string;
  mainConcern: string;
  onsetDuration: string;
  selectedSymptoms: string[];
  selectedConditions: string[];
  medicines: string;
  allergyType: string;
  allergyDetails: string;
  documents: DocumentRecord[];
  t: any;
}

export const StepReview: React.FC<StepReviewProps> = ({
  preferredName,
  age,
  mainConcern,
  onsetDuration,
  selectedSymptoms,
  selectedConditions,
  medicines,
  allergyType,
  allergyDetails,
  documents,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.reviewTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.reviewSubtitle}</p>
      </div>

      <div id="review-summary-card" className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs divide-y divide-slate-100 text-sm">
        <div className="pb-3 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-500 font-medium">Patient</span>
            <p className="font-bold text-slate-900 text-base">{preferredName || 'Demo Patient'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Age</span>
            <p className="font-semibold text-slate-800">{age || 'Unspecified'}</p>
          </div>
        </div>

        <div className="py-3">
          <span className="text-xs text-slate-500 font-medium">Main Concern</span>
          <p className="font-semibold text-slate-900 mt-0.5">{mainConcern || 'None entered'}</p>
          <span className="text-xs text-slate-500 block mt-1">Onset/Duration: {onsetDuration || 'Not stated'}</span>
        </div>

        <div className="py-3">
          <span className="text-xs text-slate-500 font-medium">Reported Symptoms</span>
          <p className="text-slate-800 mt-0.5 font-medium">
            {selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None selected'}
          </p>
        </div>

        <div className="py-3">
          <span className="text-xs text-slate-500 font-medium">Existing Conditions & Medicines</span>
          <p className="text-slate-800 mt-0.5">Conditions: {selectedConditions.join(', ') || 'None'}</p>
          <p className="text-slate-800 mt-0.5">Medicines: {medicines || 'None reported'}</p>
        </div>

        <div className="py-3">
          <span className="text-xs text-slate-500 font-medium">Allergies</span>
          <p className="text-slate-800 mt-0.5 font-medium">
            {allergyType === 'none_reported' && 'None reported'}
            {allergyType === 'unknown' && 'Unknown (Not sure)'}
            {allergyType === 'reported' && `Reported: ${allergyDetails || 'Yes'}`}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="py-3">
            <span className="text-xs text-slate-500 font-medium">Attached Documents ({documents.length})</span>
            <ul className="list-disc list-inside text-xs text-slate-700 mt-1">
              {documents.map(d => (
                <li key={d.id}>{d.fileName} ({d.ocrStatus === 'completed' ? 'Verified text' : 'Needs confirmation'})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
        <span>Your confirmed intake will be stored safely and summarized for your consulting doctor.</span>
      </div>
    </div>
  );
};