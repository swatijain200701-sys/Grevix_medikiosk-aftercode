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
        <h2 className="text-2xl font-extrabold text-[#F1F6F8] tracking-tight">{t.reviewTitle}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.reviewSubtitle}</p>
      </div>

      <div
        id="review-summary-card"
        className="p-5 rounded-2xl border border-[#294350] bg-[#18303D] space-y-4 shadow-sm divide-y divide-[#294350] text-sm"
      >
        <div className="pb-3 flex justify-between items-center">
          <div>
            <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">Patient</span>
            <p className="font-bold text-[#F1F6F8] text-base">{preferredName || "Demo Patient"}</p>
          </div>
          <div className="text-right">
            <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">Age</span>
            <p className="font-semibold text-[#F1F6F8]">{age || "Unspecified"}</p>
          </div>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">Main Concern</span>
          <p className="font-semibold text-[#F1F6F8] mt-0.5">{mainConcern || "None entered"}</p>
          <span className="text-2xs text-[#91A8B3] block mt-1">Onset / Duration: {onsetDuration || "Not stated"}</span>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">Reported Symptoms</span>
          <p className="text-[#B6C7CF] mt-0.5 font-medium">
            {selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "None reported"}
          </p>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">Existing Conditions & Medicines</span>
          <p className="text-[#B6C7CF] mt-0.5">Conditions: {selectedConditions.join(", ") || "None reported"}</p>
          <p className="text-[#B6C7CF] mt-0.5">Current Medicines: {medicines || "None reported"}</p>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">Allergies</span>
          <p className="text-[#B6C7CF] mt-0.5 font-medium">
            {allergyType === "none_reported" && "None reported (No known allergies)"}
            {allergyType === "unknown" && "Unknown / Not sure"}
            {allergyType === "reported" && `Reported: ${allergyDetails || "Yes"}`}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="py-3">
            <span className="text-2xs text-[#91A8B3] font-medium uppercase tracking-wider">
              Attached Documents ({documents.length})
            </span>
            <ul className="list-disc list-inside text-xs text-[#B6C7CF] mt-1 space-y-0.5">
              {documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({d.ocrStatus === "completed" ? "Verified text" : "Needs confirmation"})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-[#122330] border border-[#294350] text-[#50D6C5] text-xs flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-[#50D6C5] shrink-0" />
        <span>Your confirmed intake will be stored safely on this device and summarized for your consulting doctor.</span>
      </div>
    </div>
  );
};

export default StepReview;
