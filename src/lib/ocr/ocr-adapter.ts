import { createWorker } from 'tesseract.js';

export interface OcrResult {
  extractedText: string;
  confidence: 'high' | 'medium' | 'uncertain';
  hasUncertainExtraction: boolean;
  notes: string;
  engine: string;
}

/**
 * Concrete Client OCR Adapter
 * Uses Tesseract.js (WebAssembly client-side engine).
 *
 * HONEST CLINICAL BOUNDARY & AUDIT RULE:
 * - General OCR engines do NOT reliably recognize clinical cursive handwriting or complex sig codes.
 * - Low OCR confidence reflects poor text recognition clarity, NOT proof of handwriting detection.
 * - OCR extraction is treated as an initial unverified draft only.
 * - Patient or caregiver review is mandatory before inclusion in confirmed intake history.
 */
export async function processDocumentImage(file: File): Promise<OcrResult> {
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File exceeds maximum size of 5MB');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported format. Please upload JPEG, PNG, or WebP image.');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(dataUrl);
    await worker.terminate();

    const text = ret.data.text.trim();
    const tesseractConfidence = ret.data.confidence;

    let confidence: 'high' | 'medium' | 'uncertain' = 'medium';
    if (tesseractConfidence > 75) {
      confidence = 'high';
    } else if (tesseractConfidence < 50 || text.length < 5) {
      confidence = 'uncertain';
    }

    const hasUncertainExtraction = confidence === 'uncertain' || tesseractConfidence < 65;

    return {
      extractedText: text || `[Document ${file.name}]: Text unclear. Please enter medications manually.`,
      confidence,
      hasUncertainExtraction,
      notes: hasUncertainExtraction
        ? `Low extraction confidence (~${Math.round(tesseractConfidence)}%). Text may be unclear or stylized. Please verify medicine names carefully.`
        : `Tesseract OCR extracted text with ~${Math.round(tesseractConfidence)}% confidence. Review before confirming.`,
      engine: 'Tesseract.js (Client WebAssembly)',
    };
  } catch (err: any) {
    return {
      extractedText: `[Document ${file.name}]: Document captured. Please verify your medications manually.`,
      confidence: 'uncertain',
      hasUncertainExtraction: true,
      notes: `OCR processing note: ${err.message || 'Client OCR unavailable offline'}. Please enter prescription details manually.`,
      engine: 'Fallback Manual Review',
    };
  }
}