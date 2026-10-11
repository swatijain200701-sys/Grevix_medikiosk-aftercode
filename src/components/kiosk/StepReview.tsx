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
        <h2 className="text-2xl font-extrabold text-[#17343A] tracking-tight">{t.reviewTitle}</h2>
        <p className="text-[#52656B] text-sm mt-1">{t.reviewSubtitle}</p>
      </div>

      <div
        id="review-summary-card"
        className="p-5 rounded-2xl border border-[#DCE7E4] bg-white space-y-4 shadow-2xs divide-y divide-[#DCE7E4] text-sm"
      >
        <div className="pb-3 flex justify-between items-center">
          <div>
            <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">Patient</span>
            <p className="font-bold text-[#17343A] text-base">{preferredName || "Demo Patient"}</p>
          </div>
          <div className="text-right">
            <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">Age</span>
            <p className="font-semibold text-[#17343A]">{age || "Unspecified"}</p>
          </div>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">Main Concern</span>
          <p className="font-semibold text-[#17343A] mt-0.5">{mainConcern || "None entered"}</p>
          <span className="text-2xs text-[#52656B] block mt-1">Onset / Duration: {onsetDuration || "Not stated"}</span>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">Reported Symptoms</span>
          <p className="text-[#334155] mt-0.5 font-medium">
            {selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "None reported"}
          </p>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">Existing Conditions & Medicines</span>
          <p className="text-[#334155] mt-0.5">Conditions: {selectedConditions.join(", ") || "None reported"}</p>
          <p className="text-[#334155] mt-0.5">Current Medicines: {medicines || "None reported"}</p>
        </div>

        <div className="py-3">
          <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">Allergies</span>
          <p className="text-[#334155] mt-0.5 font-medium">
            {allergyType === "none_reported" && "None reported"}
            {allergyType === "unknown" && "Unknown / Not sure"}
            {allergyType === "reported" && `Reported: ${allergyDetails || "Yes"}`}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="py-3">
            <span className="text-2xs text-[#52656B] font-medium uppercase tracking-wider">
              Attached Documents ({documents.length})
            </span>
            <ul className="list-disc list-inside text-xs text-[#334155] mt-1 space-y-0.5">
              {documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({d.ocrStatus === "completed" ? "Verified text" : "Needs confirmation"})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-[#E8F3EF] border border-[#0F766E]/20 text-[#0F766E] text-xs flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
        <span>Your confirmed intake will be stored safely on this device and summarized for your consulting doctor.</span>
      </div>
    </div>
  );
};

export default StepReview;
