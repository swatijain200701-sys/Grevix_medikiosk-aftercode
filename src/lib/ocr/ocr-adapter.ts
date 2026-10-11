import { createWorker } from 'tesseract.js';

export interface OcrResult {
  extractedText: string;
  confidence: 'high' | 'medium' | 'uncertain';
  hasHandwritingOrAmbiguity: boolean;
  notes: string;
  engine: string;
}

/**
 * Concrete Client OCR Adapter
 * Uses Tesseract.js (WebAssembly client-side engine).
 *
 * HONEST CLINICAL BOUNDARY:
 * - General OCR engines do NOT reliably recognize doctor cursive handwriting or complex clinical sig codes.
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

    // Check if confidence is high, medium, or uncertain
    let confidence: 'high' | 'medium' | 'uncertain' = 'medium';
    if (tesseractConfidence > 75) {
      confidence = 'high';
    } else if (tesseractConfidence < 50 || text.length < 5) {
      confidence = 'uncertain';
    }

    const hasHandwriting = confidence === 'uncertain' || text.includes('?') || tesseractConfidence < 60;

    return {
      extractedText: text || `[Document ${file.name}]: Text unclear. Please enter medications manually.`,
      confidence,
      hasHandwritingOrAmbiguity: hasHandwriting,
      notes: hasHandwriting
        ? 'Low confidence or potential handwriting detected. Please verify medicine names carefully.'
        : `Tesseract OCR extracted text with ~${Math.round(tesseractConfidence)}% confidence. Review before confirming.`,
      engine: 'Tesseract.js (Client WebAssembly)',
    };
  } catch (err: any) {
    // Offline or WebAssembly fallback
    return {
      extractedText: `[Document ${file.name}]: Document captured. Please verify your medications.`,
      confidence: 'uncertain',
      hasHandwritingOrAmbiguity: true,
      notes: `OCR processing note: ${err.message || 'Client OCR unavailable offline'}. Please enter prescription details manually.`,
      engine: 'Fallback Manual Review',
    };
  }
}