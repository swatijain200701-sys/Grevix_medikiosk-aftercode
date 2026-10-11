import { describe, it, expect } from 'vitest';
import { evaluateRedFlags } from '../src/lib/rules/red-flags';
import { IntakeAnswers } from '../src/lib/types/schema';

describe('Local Red-Flag Rules Engine', () => {
  const baseAnswers: IntakeAnswers = {
    mainConcern: 'Routine checkup for mild cold',
    onsetDuration: '2 days',
    reportedSymptoms: ['cough'],
    existingConditions: ['none'],
    currentMedicines: [],
    allergies: { status: 'none_reported', details: [] },
    relevantPreviousCare: 'none',
    questionsForClinician: 'none',
    documents: [],
    audioRecordings: [],
  };

  it('does not trigger red flags for routine cold symptoms', () => {
    const flags = evaluateRedFlags(baseAnswers);
    expect(flags.length).toBe(0);
  });

  it('triggers urgent cardiovascular alert on chest pain report', () => {
    const answers: IntakeAnswers = {
      ...baseAnswers,
      mainConcern: 'Sudden chest pain and shortness of breath',
      reportedSymptoms: ['Chest Pain / Pressure', 'Shortness of Breath'],
    };
    const flags = evaluateRedFlags(answers);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.some(f => f.ruleId === 'rf-chest-pain-dyspnea')).toBe(true);
    expect(flags[0].severity).toBe('urgent');
  });

  it('triggers neurological alert on sudden facial weakness/speech difficulty', () => {
    const answers: IntakeAnswers = {
      ...baseAnswers,
      mainConcern: 'Sudden weakness on left arm and speech difficulty',
      reportedSymptoms: ['weakness'],
    };
    const flags = evaluateRedFlags(answers);
    expect(flags.some(f => f.ruleId === 'rf-neurological-stroke')).toBe(true);
  });

  it('triggers acute allergy flag on throat/lip swelling report', () => {
    const answers: IntakeAnswers = {
      ...baseAnswers,
      mainConcern: 'Throat swelling after eating seafood',
      allergies: { status: 'reported', details: ['seafood'] },
    };
    const flags = evaluateRedFlags(answers);
    expect(flags.some(f => f.ruleId === 'rf-anaphylaxis-allergy')).toBe(true);
  });
});