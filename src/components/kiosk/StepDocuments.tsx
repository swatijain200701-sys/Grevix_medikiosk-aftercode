'use client';
import React from 'react';
import { Upload, RefreshCw, FileText } from 'lucide-react';
import { DocumentRecord } from '@/lib/types/schema';

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
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.documentTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.documentSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white hover:bg-slate-50 transition cursor-pointer relative">
          <input
            type="file"
            id="document-upload-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
          <span className="font-semibold text-sm text-slate-800 block">{t.uploadButton}</span>
          <span className="text-xs text-slate-500 mt-1 block">Prescriptions, discharge slips, lab reports (JPEG, PNG up to 5MB)</span>
        </div>

        {isUploading && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-700" />
            Analyzing document text with local OCR...
          </div>
        )}

        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            {uploadError}
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Captured Documents ({documents.length})</h4>
            {documents.map(doc => (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold text-slate-800">{doc.fileName}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                    doc.ocrStatus === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {doc.ocrStatus === 'completed' ? 'Verified' : 'Needs Confirmation'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <label className="block font-bold text-slate-700 mb-1">{t.ocrResultTitle}</label>
                  <textarea
                    rows={3}
                    id={`ocr-text-${doc.id}`}
                    value={doc.patientConfirmedText}
                    onChange={e => confirmDocumentText(doc.id, e.target.value)}
                    className="w-full p-2 bg-white rounded border border-slate-300 text-xs text-slate-800"
                  />
                  {doc.hasHandwritingOrAmbiguity && (
                    <p className="text-amber-800 text-3xs mt-1 italic">
                      * Handwriting or unclear medicine names detected. Please adjust text if inaccurate.
                    </p>
                  )}
                </div>

                {doc.ocrStatus !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => confirmDocumentText(doc.id, doc.patientConfirmedText)}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
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