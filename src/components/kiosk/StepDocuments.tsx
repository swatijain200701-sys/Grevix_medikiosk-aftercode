"use client";

import React from "react";
import { Upload, RefreshCw, FileText } from "lucide-react";
import { DocumentRecord } from "@/lib/types/schema";

interface StepDocumentsProps {
  documents: DocumentRecord[];
  isUploading: boolean;
  uploadError: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmDocumentText: (docId: string, confirmedText: string) => void;
  t: any;
}

export const StepDocuments: React.FC<StepDocumentsProps> = ({
  documents,
  isUploading,
  uploadError,
  handleFileUpload,
  confirmDocumentText,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F1F6F8] tracking-tight">{t.documentTitle}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.documentSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-[#294350] rounded-2xl p-8 text-center bg-[#18303D] hover:border-[#50D6C5]/60 hover:bg-[#203D4D] transition cursor-pointer relative min-h-[120px] flex flex-col items-center justify-center">
          <input
            type="file"
            id="document-upload-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-[#50D6C5] mx-auto mb-2" />
          <span className="font-semibold text-sm text-[#F1F6F8] block">{t.uploadButton}</span>
          <span className="text-xs text-[#91A8B3] mt-1 block">Prescriptions, discharge slips, lab reports (JPEG, PNG up to 5MB)</span>
        </div>

        {isUploading && (
          <div className="p-3.5 bg-[#18303D] border border-[#294350] rounded-xl text-xs text-[#50D6C5] flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-[#50D6C5]" />
            <span>Analyzing document text with local OCR...</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 bg-[#2B1417] border border-[#991B1B] rounded-xl text-xs text-[#F87171]">
            {uploadError}
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#91A8B3] uppercase tracking-wide">Captured Documents ({documents.length})</h4>
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-[#294350] bg-[#18303D] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#50D6C5]" />
                    <span className="text-sm font-semibold text-[#F1F6F8]">{doc.fileName}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                      doc.ocrStatus === "completed"
                        ? "bg-[#50D6C5]/15 text-[#50D6C5] border border-[#50D6C5]/30"
                        : "bg-[#261B0E] text-[#FBBF24] border border-[#854D0E]"
                    }`}
                  >
                    {doc.ocrStatus === "completed" ? "Verified" : "Needs Confirmation"}
                  </span>
                </div>

                <div className="bg-[#122330] p-3 rounded-lg border border-[#294350] text-xs">
                  <label className="block font-bold text-[#F1F6F8] mb-1.5">{t.ocrResultTitle}</label>
                  <textarea
                    rows={3}
                    id={`ocr-text-${doc.id}`}
                    value={doc.patientConfirmedText}
                    onChange={(e) => confirmDocumentText(doc.id, e.target.value)}
                    className="w-full p-2.5 bg-[#18303D] rounded-lg border border-[#294350] text-xs text-[#F1F6F8] focus:border-[#50D6C5] outline-none"
                  />
                  {doc.hasHandwritingOrAmbiguity && (
                    <p className="text-[#FBBF24] text-3xs mt-1.5 italic">
                      * Handwriting or unclear medicine names detected. Please adjust text if inaccurate.
                    </p>
                  )}
                </div>

                {doc.ocrStatus !== "completed" && (
                  <button
                    type="button"
                    onClick={() => confirmDocumentText(doc.id, doc.patientConfirmedText)}
                    className="w-full py-2.5 bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] rounded-xl text-xs font-bold transition min-h-[44px]"
                  >
                    {t.confirmOcrText}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepDocuments;
