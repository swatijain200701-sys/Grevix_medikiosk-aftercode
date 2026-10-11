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
        <h2 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">{t.documentTitle}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t.documentSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-8 text-center bg-[var(--bg-card)] hover:border-[var(--btn-main)] hover:bg-[var(--bg-panel)]/40 transition cursor-pointer relative min-h-[120px] flex flex-col items-center justify-center">
          <input
            type="file"
            id="document-upload-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-[var(--btn-main)] mx-auto mb-2" />
          <span className="font-bold text-sm text-[var(--text-heading)] block">{t.uploadButton}</span>
          <span className="text-xs text-[var(--text-muted)] mt-1 block">Prescriptions, discharge slips, lab reports (JPEG, PNG up to 5MB)</span>
        </div>

        {isUploading && (
          <div className="p-3.5 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-heading)] flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--btn-main)]" />
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
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Captured Documents ({documents.length})</h4>
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--btn-main)]" />
                    <span className="text-sm font-bold text-[var(--text-heading)]">{doc.fileName}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                      doc.ocrStatus === "completed"
                        ? "bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[#356B62]/40"
                        : "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]"
                    }`}
                  >
                    {doc.ocrStatus === "completed" ? "Verified" : "Needs Confirmation"}
                  </span>
                </div>

                <div className="bg-[var(--bg-panel)]/50 p-3 rounded-lg border border-[var(--border-color)] text-xs">
                  <label htmlFor={`ocr-text-${doc.id}`} className="block font-bold text-[var(--text-heading)] mb-1.5">{t.ocrResultTitle}</label>
                  <textarea
                    rows={3}
                    id={`ocr-text-${doc.id}`}
                    value={doc.patientConfirmedText}
                    onChange={(e) => confirmDocumentText(doc.id, e.target.value)}
                    className="w-full p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-heading)] focus:border-[#356B62] outline-none"
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
                    className="w-full py-2.5 bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] rounded-xl text-xs font-bold transition min-h-[44px]"
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