import { IntakeAnswers, RedFlagAlert } from '@/lib/types/schema';

/**
 * MediKiosk Red-Flag Attention Rule Engine
 *
 * CLINICAL DISCLAIMER & SAFETY BOUNDARY:
 * This is an unvalidated demonstration ruleset designed to alert on-duty staff to high-concern complaints.
 * It does NOT diagnose medical conditions, replace clinical triage, or classify patients as medically safe.
 * It runs entirely locally on the kiosk so it functions during network disconnection.
 */

interface RedFlagRule {
  id: string;
  category: 'cardiovascular' | 'neurological' | 'respiratory' | 'anaphylaxis' | 'infection' | 'acute';
  severity: 'urgent' | 'attention_needed';
  title: string;
  patientMessageEn: string;
  patientMessageHi: string;
  staffMessage: string;
  evaluate: (answers: IntakeAnswers) => { matched: boolean; supportingField: string; supportingAnswer: string };
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'rf-chest-pain-dyspnea',
    category: 'cardiovascular',
    severity: 'urgent',
    title: 'Chest Discomfort / Breathlessness',
    patientMessageEn: 'You reported severe chest pain or shortness of breath. Please notify the hospital desk immediately.',
    patientMessageHi: 'आपने सीने में दर्द या सांस लेने में तकलीफ की जानकारी दी है। कृपया तुरंत अस्पताल डेस्क को सूचित करें।',
    staffMessage: 'Patient reported chest pain or shortness of breath. Immediate triage evaluation advised.',
    evaluate: (answers: IntakeAnswers) => {
      const text = `${answers.mainConcern} ${answers.reportedSymptoms.join(' ')}`.toLowerCase();
      const hasChestPain = text.includes('chest pain') || text.includes('chest pressure') || text.includes('सीने में दर्द');
      const hasDyspnea = text.includes('short of breath') || text.includes('difficulty breathing') || text.includes('breathless') || text.includes('सांस फूल');

      if (hasChestPain || (hasChestPain && hasDyspnea)) {
        return {
          matched: true,
          supportingField: 'mainConcern / reportedSymptoms',
          supportingAnswer: answers.mainConcern || answers.reportedSymptoms.join(', '),
        };
      }
      return { matched: false, supportingField: '', supportingAnswer: '' };
    },
  },
  {
    id: 'rf-neurological-stroke',
    category: 'neurological',
    severity: 'urgent',
    title: 'Sudden Neurological Weakness / Speech Difficulty',
    patientMessageEn: 'You reported sudden weakness or speech difficulty. Please inform staff right away.',
    patientMessageHi: 'आपने अचानक कमजोरी या बोलने में कठिनाई बताई है। कृपया तुरंत स्टाफ को बताएं।',
    staffMessage: 'Potential acute neurological/stroke sign: sudden weakness or speech impairment reported.',
    evaluate: (answers: IntakeAnswers) => {
      const text = `${answers.mainConcern} ${answers.reportedSymptoms.join(' ')}`.toLowerCase();
      const matched = text.includes('speech') || text.includes('facial drop') || text.includes('face drooping') || text.includes('sudden weakness') || text.includes('paralysis') || text.includes('बोलने में दिक्कत') || text.includes('अचानक कमजोरी');
      if (matched) {
        return {
          matched: true,
          supportingField: 'mainConcern / reportedSymptoms',
          supportingAnswer: answers.mainConcern,
        };
      }
      return { matched: false, supportingField: '', supportingAnswer: '' };
    },
  },
  {
    id: 'rf-anaphylaxis-allergy',
    category: 'anaphylaxis',
    severity: 'urgent',
    title: 'Acute Allergic Reaction / Airway Swelling',
    patientMessageEn: 'Possible severe allergic reaction reported. Please ask a nurse or staff member for assistance now.',
    patientMessageHi: 'गंभीर एलर्जी के लक्षण दिखे हैं। कृपया तुरंत किसी नर्स या अस्पताल कर्मचारी से संपर्क करें।',
    staffMessage: 'Possible acute allergy / swelling of throat, lips, or respiratory involvement reported.',
    evaluate: (answers: IntakeAnswers) => {
      const text = `${answers.mainConcern} ${answers.allergies.details.join(' ')} ${answers.reportedSymptoms.join(' ')}`.toLowerCase();
      const matched = text.includes('throat swelling') || text.includes('lip swelling') || text.includes('tongue swelling') || text.includes('गले में सूजन') || (text.includes('allergy') && text.includes('breathing'));
      if (matched) {
        return {
          matched: true,
          supportingField: 'allergies / symptoms',
          supportingAnswer: answers.allergies.details.join(', ') || answers.mainConcern,
        };
      }
      return { matched: false, supportingField: '', supportingAnswer: '' };
    },
  },
  {
    id: 'rf-high-fever-neck-stiffness',
    category: 'infection',
    severity: 'attention_needed',
    title: 'High Fever with Stiffness or Altered Sensorium',
    patientMessageEn: 'High fever with stiffness reported. Please notify the nursing station.',
    patientMessageHi: 'तेज बुखार और अकड़न की सूचना। कृपया नर्सिंग स्टेशन को बताएं।',
    staffMessage: 'High fever with reported neck stiffness or altered alertness. Requires clinical assessment.',
    evaluate: (answers: IntakeAnswers) => {
      const text = `${answers.mainConcern} ${answers.reportedSymptoms.join(' ')}`.toLowerCase();
      const hasFever = text.includes('fever') || text.includes('तेज बुखार');
      const hasStiff = text.includes('stiff neck') || text.includes('confusion') || text.includes('गर्दन अकड़');
      if (hasFever && hasStiff) {
        return {
          matched: true,
          supportingField: 'reportedSymptoms',
          supportingAnswer: answers.mainConcern || answers.reportedSymptoms.join(', '),
        };
      }
      return { matched: false, supportingField: '', supportingAnswer: '' };
    },
  },
];

export function evaluateRedFlags(answers: IntakeAnswers): RedFlagAlert[] {
  const alerts: RedFlagAlert[] = [];
  const now = new Date().toISOString();

  for (const rule of RED_FLAG_RULES) {
    const result = rule.evaluate(answers);
    if (result.matched) {
      alerts.push({
        id: `rf-${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        patientMessageEn: rule.patientMessageEn,
        patientMessageHi: rule.patientMessageHi,
        staffMessage: rule.staffMessage,
        supportingField: result.supportingField,
        supportingAnswer: result.supportingAnswer,
        detectedLocally: true,
        deliveredToStaff: false,
        detectedAt: now,
      });
    }
  }

  return alerts;
}