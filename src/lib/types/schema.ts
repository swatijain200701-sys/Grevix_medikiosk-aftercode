import { z } from 'zod';

export type Language = 'en' | 'hi';

export const ConsentSchema = z.object({
  recordingConsent: z.boolean(),
  localOfflineStorageConsent: z.boolean(),
  aiProcessingConsent: z.boolean(),
  consentedAt: z.string(),
});
export type Consent = z.infer<typeof ConsentSchema>;

export const PatientRegistrationSchema = z.object({
  preferredName: z.string().min(1, 'Name is required').max(100),
  age: z.string().min(1, 'Age or age range is required'),
  gender: z.string().optional().default('unspecified'),
  language: z.enum(['en', 'hi']).default('en'),
  assistedEntry: z.object({
    isAssisted: z.boolean().default(false),
    enteredBy: z.enum(['self', 'caregiver', 'staff']).default('self'),
    caregiverName: z.string().optional(),
  }),
});
export type PatientRegistration = z.infer<typeof PatientRegistrationSchema>;

export const AllergyInfoSchema = z.object({
  status: z.enum(['none_reported', 'unknown', 'reported']),
  details: z.array(z.string()).default([]),
});
export type AllergyInfo = z.infer<typeof AllergyInfoSchema>;

export const DocumentRecordSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileDataUrl: z.string().optional(),
  fileSize: z.number(),
  uploadedAt: z.string(),
  ocrStatus: z.enum(['idle', 'processing', 'completed', 'failed', 'needs_confirmation']),
  extractedText: z.string().default(''),
  patientConfirmedText: z.string().default(''),
  confidence: z.enum(['high', 'medium', 'uncertain']),
  notes: z.string().optional(),
  hasHandwritingOrAmbiguity: z.boolean().default(false),
});
export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;

export const AudioRecordSchema = z.object({
  id: z.string(),
  recordedAt: z.string(),
  durationSeconds: z.number(),
  mimeType: z.string(),
  audioDataUrl: z.string().optional(),
  transcriptionStatus: z.enum(['idle', 'processing', 'completed', 'failed', 'needs_confirmation']),
  transcript: z.string().default(''),
  patientConfirmedTranscript: z.string().default(''),
});
export type AudioRecord = z.infer<typeof AudioRecordSchema>;

export const IntakeAnswersSchema = z.object({
  mainConcern: z.string().min(1, 'Main concern is required'),
  onsetDuration: z.string().min(1, 'Onset and duration are required'),
  reportedSymptoms: z.array(z.string()).default([]),
  existingConditions: z.array(z.string()).default([]),
  currentMedicines: z.array(z.string()).default([]),
  allergies: AllergyInfoSchema,
  relevantPreviousCare: z.string().default('none reported'),
  questionsForClinician: z.string().default('none'),
  documents: z.array(DocumentRecordSchema).default([]),
  audioRecordings: z.array(AudioRecordSchema).default([]),
});
export type IntakeAnswers = z.infer<typeof IntakeAnswersSchema>;

export const SourceReferenceSchema = z.object({
  id: z.string(),
  category: z.string(),
  field: z.string(),
  excerpt: z.string(),
});
export type SourceReference = z.infer<typeof SourceReferenceSchema>;

export const ConditionSummaryItemSchema = z.object({
  condition: z.string(),
  sourceId: z.string(),
  sourceExcerpt: z.string(),
});

export const MedicineSummaryItemSchema = z.object({
  name: z.string(),
  dosage: z.string().optional(),
  sourceId: z.string(),
  sourceExcerpt: z.string(),
  uncertain: z.boolean().default(false),
});

export const DocumentObservationItemSchema = z.object({
  observation: z.string(),
  documentId: z.string(),
  sourceExcerpt: z.string(),
});

export const StructuredAiSummarySchema = z.object({
  mainConcern: z.string(),
  historyOfPresentConcern: z.string(),
  reportedConditions: z.array(ConditionSummaryItemSchema).default([]),
  medicines: z.array(MedicineSummaryItemSchema).default([]),
  allergies: z.object({
    status: z.enum(['none_reported', 'unknown', 'reported']),
    items: z.array(z.string()).default([]),
    sourceId: z.string().default('allergies-field'),
  }),
  relevantDocumentObservations: z.array(DocumentObservationItemSchema).default([]),
  missingOrConflictingInfo: z.array(z.string()).default([]),
  sourceReferences: z.array(SourceReferenceSchema).default([]),
  unsupportedOrContradictoryFlags: z.array(z.string()).default([]),
  inputRevision: z.number(),
  generatedAt: z.string(),
  provider: z.string(),
  aiStatus: z.enum(['generated', 'pending', 'failed', 'unconfigured']),
});
export type StructuredAiSummary = z.infer<typeof StructuredAiSummarySchema>;

export const RedFlagAlertSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  severity: z.enum(['attention_needed', 'urgent']),
  title: z.string(),
  patientMessageEn: z.string(),
  patientMessageHi: z.string(),
  staffMessage: z.string(),
  supportingField: z.string(),
  supportingAnswer: z.string(),
  detectedLocally: z.boolean().default(true),
  deliveredToStaff: z.boolean().default(false),
  detectedAt: z.string(),
});
export type RedFlagAlert = z.infer<typeof RedFlagAlertSchema>;

export const CaseStatusSchema = z.enum([
  'draft',
  'completed_locally',
  'queued',
  'syncing',
  'synced',
  'awaiting_confirmation',
  'summary_pending',
  'ready_for_review',
  'reviewed',
]);
export type CaseStatus = z.infer<typeof CaseStatusSchema>;

export const PatientCaseSnapshotSchema = z.object({
  caseId: z.string(),
  revision: z.number().int().positive(),
  idempotencyKey: z.string(),
  schemaVersion: z.literal(1).default(1),
  status: CaseStatusSchema,
  patient: PatientRegistrationSchema,
  consent: ConsentSchema,
  answers: IntakeAnswersSchema,
  redFlags: z.array(RedFlagAlertSchema).default([]),
  createdAt: z.string(),
  lastLocalEditAt: z.string(),
  lastPatientConfirmedAt: z.string(),
  syncedAt: z.string().nullable().default(null),
  serverReceivedAt: z.string().nullable().default(null),
  summaryGeneratedAt: z.string().nullable().default(null),
  requiresReconfirmation: z.boolean().default(false),
});
export type PatientCaseSnapshot = z.infer<typeof PatientCaseSnapshotSchema>;

export const StaffReviewSchema = z.object({
  caseId: z.string(),
  triageCategory: z.enum(['routine', 'priority', 'attention_flagged']).default('routine'),
  staffNotes: z.string().default(''),
  reviewedBy: z.string().nullable().default(null),
  acknowledgedAt: z.string().nullable().default(null),
  updatedAt: z.string(),
});
export type StaffReview = z.infer<typeof StaffReviewSchema>;

export const SyncPayloadSchema = z.object({
  caseId: z.string(),
  revision: z.number().int().positive(),
  idempotencyKey: z.string(),
  snapshot: PatientCaseSnapshotSchema,
  clientTimestamp: z.string(),
});
export type SyncPayload = z.infer<typeof SyncPayloadSchema>;

export const SyncResponseSchema = z.object({
  success: z.boolean(),
  caseId: z.string(),
  acceptedRevision: z.number(),
  serverTimestamp: z.string(),
  duplicate: z.boolean(),
  message: z.string(),
  summaryStatus: z.enum(['generated', 'pending', 'unconfigured', 'failed']),
  summary: StructuredAiSummarySchema.optional(),
});
export type SyncResponse = z.infer<typeof SyncResponseSchema>;