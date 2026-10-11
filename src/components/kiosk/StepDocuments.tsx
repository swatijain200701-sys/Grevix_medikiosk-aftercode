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
        <h2 className="text-2xl font-bold text-[#293D36] tracking-tight">{t.documentTitle}</h2>
        <p className="text-[#53665D] text-sm mt-1">{t.documentSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-[#B8C9BD] rounded-2xl p-8 text-center bg-[#FAF7F0] hover:border-[#356B62] hover:bg-[#D8E5DC]/40 transition cursor-pointer relative min-h-[120px] flex flex-col items-center justify-center">
          <input
            type="file"
            id="document-upload-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-[#356B62] mx-auto mb-2" />
          <span className="font-bold text-sm text-[#293D36] block">{t.uploadButton}</span>
          <span className="text-xs text-[#53665D] mt-1 block">Prescriptions, discharge slips, lab reports (JPEG, PNG up to 5MB)</span>
        </div>

        {isUploading && (
          <div className="p-3.5 bg-[#D8E5DC] border border-[#B8C9BD] rounded-xl text-xs text-[#293D36] flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-[#356B62]" />
            <span>Analyzing document text with local OCR...</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 bg-[#FEE2E2] border border-[#EF4444] rounded-xl text-xs text-[#991B1B] font-semibold">
            {uploadError}
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#53665D] uppercase tracking-wide">Captured Documents ({documents.length})</h4>
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#356B62]" />
                    <span className="text-sm font-bold text-[#293D36]">{doc.fileName}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                      doc.ocrStatus === "completed"
                        ? "bg-[#D8E5DC] text-[#356B62] border border-[#356B62]/40"
                        : "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]"
                    }`}
                  >
                    {doc.ocrStatus === "completed" ? "Verified" : "Needs Confirmation"}
                  </span>
                </div>

                <div className="bg-[#D8E5DC]/50 p-3 rounded-lg border border-[#B8C9BD] text-xs">
                  <label htmlFor={`ocr-text-${doc.id}`} className="block font-bold text-[#293D36] mb-1.5">{t.ocrResultTitle}</label>
                  <textarea
                    rows={3}
                    id={`ocr-text-${doc.id}`}
                    value={doc.patientConfirmedText}
                    onChange={(e) => confirmDocumentText(doc.id, e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F0] rounded-lg border border-[#B8C9BD] text-xs text-[#293D36] focus:border-[#356B62] outline-none"
                  />
                  {doc.hasHandwritingOrAmbiguity && (
                    <p className="text-[#92400E] text-3xs mt-1.5 italic">
                      * Handwriting or unclear medicine names detected. Please adjust text if inaccurate.
                    </p>
                  )}
                </div>

                {doc.ocrStatus !== "completed" && (
                  <button
                    type="button"
                    onClick={() => confirmDocumentText(doc.id, doc.patientConfirmedText)}
                    className="w-full py-2.5 bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] rounded-xl text-xs font-bold transition min-h-[44px]"
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