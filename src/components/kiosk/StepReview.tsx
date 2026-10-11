"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { DocumentRecord } from "@/lib/types/schema";

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
        <h2 className="text-2xl font-bold text-[#293D36] tracking-tight">{t.reviewTitle}</h2>
        <p className="text-[#53665D] text-sm mt-1">{t.reviewSubtitle}</p>
      </div>

      <div
        id="review-summary-card"
        className="p-5 rounded-2xl border border-[#B8C9BD] bg-[#FAF7F0] space-y-4 shadow-sm divide-y divide-[#B8C9BD] text-sm"
      >
        <div className="pb-3 flex justify-between items-center">
          <div>
            <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">Patient</span>
            <p className="font-bold text-[#293D36] text-base">{preferredName || "Not specified"}</p>
          </div>
          <div className="text-right">
            <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">Age</span>
            <p className="font-bold text-[#293D36]">{age || "Not specified"}</p>
          </div>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">Main Health Concern</span>
          <p className="font-semibold text-[#293D36] mt-0.5">{mainConcern || "None entered"}</p>
          <span className="text-2xs text-[#53665D] block mt-1">Onset / Duration: {onsetDuration || "Not stated"}</span>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">Reported Symptoms</span>
          <p className="text-[#293D36] mt-0.5 font-medium">
            {selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "None reported"}
          </p>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">Existing Conditions & Medicines</span>
          <p className="text-[#293D36] mt-0.5">Conditions: {selectedConditions.join(", ") || "None reported"}</p>
          <p className="text-[#293D36] mt-0.5">Current Medicines: {medicines || "None reported"}</p>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">Allergies</span>
          <p className="text-[#293D36] mt-0.5 font-medium">
            {allergyType === "none_reported" && "No known allergies"}
            {allergyType === "unknown" && "Allergy history unknown / uncertain"}
            {allergyType === "reported" && `Known allergy: ${allergyDetails || "Yes"}`}
            {(!allergyType || allergyType === "unanswered") && (
              <span className="text-red-600 font-bold">Unanswered (Please select an allergy choice before submitting)</span>
            )}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="py-3">
            <span className="text-2xs text-[#53665D] font-bold uppercase tracking-wider">
              Attached Documents ({documents.length})
            </span>
            <ul className="list-disc list-inside text-xs text-[#293D36] mt-1 space-y-0.5">
              {documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({d.ocrStatus === "completed" ? "Verified text" : "Needs confirmation"})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-[#D8E5DC] border border-[#B8C9BD] text-[#293D36] text-xs flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-[#356B62] shrink-0" />
        <span>Your confirmed intake will be stored safely on this device and queued for hospital staff review.</span>
      </div>
    </div>
  );
};

export default StepReview;