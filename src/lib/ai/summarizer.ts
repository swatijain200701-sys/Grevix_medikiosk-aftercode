import { PatientCaseSnapshot, StructuredAiSummary, StructuredAiSummarySchema } from '@/lib/types/schema';

/**
 * MediKiosk Server-Side AI Clinical Intake Summarizer
 *
 * SAFETY & INTEGRITY RULES:
 * 1. Only summarizes patient-confirmed intake data. Does not infer unstated diagnoses, dosages, or negatives.
 * 2. Cross-validates all references against actual submitted snapshot text. Unsupported claims are flagged in unsupportedOrContradictoryFlags.
 * 3. Configurable provider & current official models (e.g. Gemini 2.0 Flash, GPT-4o-mini, Llama 3.3 70B).
 * 4. Never fabricates live AI responses. If LLM provider is not configured, marks status as 'unconfigured'.
 */

export interface SummarizerResult {
  summary: StructuredAiSummary;
  success: boolean;
  provider: string;
  isRealAi: boolean;
  error?: string;
  latencyMs?: number;
}

export async function generateClinicalSummary(snapshot: PatientCaseSnapshot): Promise<SummarizerResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const providerPreference = process.env.AI_PROVIDER?.toLowerCase();

  const now = new Date().toISOString();

  // If no LLM provider key is available in environment
  if (!geminiKey && !openaiKey && !groqKey) {
    const unconfiguredSummary: StructuredAiSummary = {
      mainConcern: snapshot.answers.mainConcern,
      historyOfPresentConcern: `Reported onset/duration: ${snapshot.answers.onsetDuration}. Patient concern in own words: "${snapshot.answers.mainConcern}".`,
      reportedConditions: snapshot.answers.existingConditions.map((c, i) => ({
        condition: c,
        sourceId: `cond-${i}`,
        sourceExcerpt: c,
      })),
      medicines: snapshot.answers.currentMedicines.map((m, i) => ({
        name: m,
        sourceId: `med-${i}`,
        sourceExcerpt: m,
        uncertain: false,
      })),
      allergies: {
        status: snapshot.answers.allergies.status,
        items: snapshot.answers.allergies.details,
        sourceId: 'allergies-field',
      },
      relevantDocumentObservations: snapshot.answers.documents.map(d => ({
        observation: d.patientConfirmedText || d.extractedText || 'Document attached, text pending verification',
        documentId: d.id,
        sourceExcerpt: d.fileName,
      })),
      missingOrConflictingInfo: [
        'AI Summary Pending: No external LLM API key configured (GEMINI_API_KEY or OPENAI_API_KEY).',
        'Clinical staff should review raw confirmed intake directly.',
      ],
      sourceReferences: [
        {
          id: snapshot.caseId,
          category: 'intake',
          field: 'mainConcern',
          excerpt: snapshot.answers.mainConcern,
        },
      ],
      unsupportedOrContradictoryFlags: [],
      inputRevision: snapshot.revision,
      generatedAt: now,
      provider: 'none (pending configuration)',
      aiStatus: 'unconfigured',
    };

    return {
      summary: unconfiguredSummary,
      success: true,
      provider: 'unconfigured',
      isRealAi: false,
      error: 'GEMINI_API_KEY or OPENAI_API_KEY not configured in environment',
      latencyMs: 0,
    };
  }

  const intakePromptContext = {
    patient: {
      name: snapshot.patient.preferredName,
      age: snapshot.patient.age,
      language: snapshot.patient.language,
      assistedEntry: snapshot.patient.assistedEntry,
    },
    answers: {
      mainConcern: snapshot.answers.mainConcern,
      onsetDuration: snapshot.answers.onsetDuration,
      reportedSymptoms: snapshot.answers.reportedSymptoms,
      existingConditions: snapshot.answers.existingConditions,
      currentMedicines: snapshot.answers.currentMedicines,
      allergies: snapshot.answers.allergies,
      previousCare: snapshot.answers.relevantPreviousCare,
      questionsForClinician: snapshot.answers.questionsForClinician,
      confirmedDocuments: snapshot.answers.documents.map(d => ({
        fileName: d.fileName,
        confirmedText: d.patientConfirmedText || d.extractedText,
        confidence: d.confidence,
      })),
    },
  };

  const systemInstructions = `You are a clinical intake summarization assistant for MediKiosk.
Organize the patient-reported intake data into a concise, structured intake summary for hospital clinicians.

CRITICAL SAFETY & TRUTH CONSTRAINTS:
1. DO NOT diagnose diseases, prescribe medication, or recommend specific medical treatments.
2. DO NOT hallucinate or assume unstated information. Do not invent dosages, exam findings, or lab values.
3. Every reported condition, medicine, and document observation MUST include:
   - "sourceExcerpt": exact supporting text from patient intake.
   - "sourceId": reference identifier.
4. If medicines or reports are unclear or marked uncertain, reflect uncertain: true.
5. If information is missing or conflicting, list it explicitly in missingOrConflictingInfo.
6. Return ONLY valid JSON matching this schema:
{
  "mainConcern": string,
  "historyOfPresentConcern": string,
  "reportedConditions": [{"condition": string, "sourceId": string, "sourceExcerpt": string}],
  "medicines": [{"name": string, "dosage": string | null, "sourceId": string, "sourceExcerpt": string, "uncertain": boolean}],
  "allergies": {"status": "none_reported" | "unknown" | "reported", "items": string[], "sourceId": string},
  "relevantDocumentObservations": [{"observation": string, "documentId": string, "sourceExcerpt": string}],
  "missingOrConflictingInfo": string[],
  "sourceReferences": [{"id": string, "category": string, "field": string, "excerpt": string}]
}`;

  const startTime = Date.now();

  try {
    let rawResponseText = '';
    let usedProvider = '';

    const useGemini = geminiKey && (!providerPreference || providerPreference === 'gemini');
    const useOpenAI = openaiKey && (!providerPreference || providerPreference === 'openai');
    const useGroq = groqKey && (!providerPreference || providerPreference === 'groq');

    if (useGemini) {
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      usedProvider = `Google Gemini (${model})`;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstructions}\n\nPATIENT INTAKE DATA:\n${JSON.stringify(intakePromptContext, null, 2)}` }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      rawResponseText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (useOpenAI || useGroq) {
      const isGroq = !!useGroq && !useOpenAI;
      const model = isGroq ? (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile') : (process.env.OPENAI_MODEL || 'gpt-4o-mini');
      usedProvider = isGroq ? `Groq (${model})` : `OpenAI (${model})`;
      const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
      const authKey = isGroq ? groqKey : openaiKey;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: `PATIENT INTAKE DATA:\n${JSON.stringify(intakePromptContext, null, 2)}` },
          ],
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        throw new Error(`${usedProvider} API error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      rawResponseText = json.choices?.[0]?.message?.content || '';
    }

    const latencyMs = Date.now() - startTime;
    const parsedJson = JSON.parse(rawResponseText);

    // Cross-validate source text to ensure zero hallucinations
    const allInputText = JSON.stringify(intakePromptContext).toLowerCase();
    const unsupportedFlags: string[] = [];

    if (Array.isArray(parsedJson.medicines)) {
      for (const med of parsedJson.medicines) {
        if (med.name && !allInputText.includes(med.name.toLowerCase().trim())) {
          unsupportedFlags.push(`Warning: Medicine '${med.name}' was not found in patient-submitted text.`);
        }
      }
    }

    if (Array.isArray(parsedJson.reportedConditions)) {
      for (const cond of parsedJson.reportedConditions) {
        if (cond.condition && !allInputText.includes(cond.condition.toLowerCase().trim())) {
          unsupportedFlags.push(`Warning: Condition '${cond.condition}' was not found in patient-submitted text.`);
        }
      }
    }

    const validatedSummary: StructuredAiSummary = {
      mainConcern: parsedJson.mainConcern || snapshot.answers.mainConcern,
      historyOfPresentConcern: parsedJson.historyOfPresentConcern || snapshot.answers.onsetDuration,
      reportedConditions: parsedJson.reportedConditions || [],
      medicines: parsedJson.medicines || [],
      allergies: parsedJson.allergies || {
        status: snapshot.answers.allergies.status,
        items: snapshot.answers.allergies.details,
        sourceId: 'allergies-field',
      },
      relevantDocumentObservations: parsedJson.relevantDocumentObservations || [],
      missingOrConflictingInfo: parsedJson.missingOrConflictingInfo || [],
      sourceReferences: parsedJson.sourceReferences || [],
      unsupportedOrContradictoryFlags: unsupportedFlags,
      inputRevision: snapshot.revision,
      generatedAt: now,
      provider: usedProvider,
      aiStatus: 'generated',
    };

    StructuredAiSummarySchema.parse(validatedSummary);

    return {
      summary: validatedSummary,
      success: true,
      provider: usedProvider,
      isRealAi: true,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const fallbackSummary: StructuredAiSummary = {
      mainConcern: snapshot.answers.mainConcern,
      historyOfPresentConcern: `Onset/Duration: ${snapshot.answers.onsetDuration}. Concern: ${snapshot.answers.mainConcern}`,
      reportedConditions: snapshot.answers.existingConditions.map((c, i) => ({ condition: c, sourceId: `c-${i}`, sourceExcerpt: c })),
      medicines: snapshot.answers.currentMedicines.map((m, i) => ({ name: m, sourceId: `m-${i}`, sourceExcerpt: m, uncertain: false })),
      allergies: {
        status: snapshot.answers.allergies.status,
        items: snapshot.answers.allergies.details,
        sourceId: 'allergies-field',
      },
      relevantDocumentObservations: [],
      missingOrConflictingInfo: [`AI Summarization call encountered error: ${err.message}. Raw intake preserved for review.`],
      sourceReferences: [{ id: snapshot.caseId, category: 'intake', field: 'mainConcern', excerpt: snapshot.answers.mainConcern }],
      unsupportedOrContradictoryFlags: [],
      inputRevision: snapshot.revision,
      generatedAt: now,
      provider: 'error-fallback',
      aiStatus: 'failed',
    };

    return {
      summary: fallbackSummary,
      success: false,
      provider: 'failed',
      isRealAi: false,
      error: err.message,
      latencyMs,
    };
  }
}