import { IntakeAnswers, RedFlagAlert } from "@/lib/types/schema";

/**
 * MediKiosk Red-Flag Attention Prompts Engine
 *
 * CLINICAL DISCLAIMER & SAFETY BOUNDARY:
 * These rules are demonstrative staff-attention prompts designed to highlight high-concern
 * symptoms for on-duty clinical staff review.
 * They DO NOT constitute a triage protocol, clinical validation, or diagnostic determination.
 * ABSENCE OF A TRIGGER NEVER IMPLIES THE PATIENT IS MEDICALLY SAFE.
 * Runs locally on the kiosk so it functions during network disconnections.
 */

interface RedFlagRule {
  id: string;
  category: "cardiovascular" | "neurological" | "respiratory" | "anaphylaxis" | "infection" | "acute";
  severity: "urgent" | "attention_needed";
  title: string;
  patientMessageEn: string;
  patientMessageHi: string;
  staffMessage: string;
  evaluate: (answers: IntakeAnswers) => { matched: boolean; supportingField: string; supportingAnswer: string };
}

/**
 * Checks whether any phrase is present and NOT negated or purely historical.
 */
function isPresentWithSafeguards(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();

  for (const phrase of phrases) {
    const idx = lower.indexOf(phrase.toLowerCase());
    if (idx === -1) continue;

    // Check negation safeguard: precedes phrase by up to 25 characters
    const beforeSnippet = lower.substring(Math.max(0, idx - 25), idx);
    const negationRegex = /\b(no|not|denies|denied|without|never had|free of|negative for)\s*$/i;
    if (negationRegex.test(beforeSnippet)) {
      continue; // Negated symptom
    }

    // Check historical-context safeguard (e.g. "5 years ago", "resolved", "history of ... in 2018")
    const contextSnippet = lower.substring(Math.max(0, idx - 40), Math.min(lower.length, idx + phrase.length + 40));
    const historicalRegex = /\b(years ago|months ago|past history of|resolved|treated in \d{4}|former)\b/i;
    if (historicalRegex.test(contextSnippet) && !lower.includes("currently") && !lower.includes("today") && !lower.includes("now")) {
      continue; // Historical only
    }

    return true;
  }

  return false;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: "rf-chest-pain-dyspnea",
    category: "cardiovascular",
    severity: "urgent",
    title: "Chest Discomfort / Breathlessness",
    patientMessageEn: "You reported severe chest discomfort or shortness of breath. Please notify the hospital desk immediately.",
    patientMessageHi: "आपने सीने में दर्द या साँस लेने में तकलीफ़ दर्ज की है। कृपया तुरंत अस्पताल काउंटर या नर्स को बताएं।",
    staffMessage: "Patient reported chest pain, pressure, or shortness of breath. Immediate triage evaluation advised.",
    evaluate: (answers: IntakeAnswers) => {
      const combinedText = `${answers.mainConcern} ${answers.onsetDuration} ${answers.reportedSymptoms.join(" ")}`;

      const chestPhrases = [
        "chest pain", "chest pressure", "chest tightness", "chest heaviness", "angina",
        "सीने में दर्द", "छाती में दर्द", "छाती में दबाव"
      ];
      const dyspneaPhrases = [
        "short of breath", "shortness of breath", "difficulty breathing", "breathless",
        "breathlessness", "trouble breathing", "can't breathe", "cannot breathe",
        "साँस लेने में तकलीफ़", "साँस फूलना", "दम घुटना"
      ];
      const faintPhrases = [
        "feel faint", "feeling faint", "fainting", "fainted", "blackout", "passed out", "syncope", "चक्कर और बेहोशी"
      ];

      // Structured symptom selections
      const symptomLower = answers.reportedSymptoms.map((s) => s.toLowerCase());
      const structuredChest = symptomLower.some((s) => s.includes("chest pain") || s.includes("छाती में दर्द"));
      const structuredDyspnea = symptomLower.some(
        (s) => s.includes("shortness of breath") || s.includes("short_breath") || s.includes("breathlessness") || s.includes("साँस")
      );

      const hasTextChest = isPresentWithSafeguards(combinedText, chestPhrases);
      const hasTextDyspnea = isPresentWithSafeguards(combinedText, dyspneaPhrases);
      const hasFaint = isPresentWithSafeguards(combinedText, faintPhrases);

      // Trigger if:
      // 1. Chest pain reported (structured or text)
      // 2. Shortness of breath reported ALONE (structured or text)
      // 3. Shortness of breath + feeling faint
      const matched = hasTextChest || structuredChest || hasTextDyspnea || structuredDyspnea || (hasTextDyspnea && hasFaint);

      if (matched) {
        const supporting = answers.mainConcern || answers.reportedSymptoms.join(", ") || "Reported respiratory/cardiac symptom";
        return {
          matched: true,
          supportingField: "mainConcern / reportedSymptoms",
          supportingAnswer: supporting,
        };
      }

      return { matched: false, supportingField: "", supportingAnswer: "" };
    },
  },
  {
    id: "rf-neurological-stroke",
    category: "neurological",
    severity: "urgent",
    title: "Sudden Neurological Weakness / Speech Difficulty",
    patientMessageEn: "You reported sudden weakness or speech difficulty. Please inform staff right away.",
    patientMessageHi: "आपने अचानक कमजोरी या बोलने में कठिनाई दर्ज की है। कृपया तुरंत अस्पताल स्टाफ को बताएं।",
    staffMessage: "Potential acute neurological/stroke sign: sudden weakness or speech impairment reported.",
    evaluate: (answers: IntakeAnswers) => {
      const combinedText = `${answers.mainConcern} ${answers.reportedSymptoms.join(" ")}`;
      const strokePhrases = [
        "speech difficulty", "slurred speech", "facial drop", "face drooping",
        "sudden weakness", "arm weakness", "leg weakness", "paralysis", "one sided weakness",
        "बोलने में कठिनाई", "अचानक कमजोरी", "मुंह टेढ़ा होना"
      ];

      const matched = isPresentWithSafeguards(combinedText, strokePhrases);
      if (matched) {
        return {
          matched: true,
          supportingField: "mainConcern / reportedSymptoms",
          supportingAnswer: answers.mainConcern || answers.reportedSymptoms.join(", "),
        };
      }
      return { matched: false, supportingField: "", supportingAnswer: "" };
    },
  },
  {
    id: "rf-anaphylaxis-allergy",
    category: "anaphylaxis",
    severity: "urgent",
    title: "Acute Allergic Reaction / Airway Swelling",
    patientMessageEn: "Possible severe allergic reaction reported. Please ask a nurse or staff member for assistance now.",
    patientMessageHi: "गंभीर एलर्जी के लक्षण दर्ज किए गए हैं। कृपया तुरंत किसी नर्स या अस्पताल कर्मचारी से सहायता मांगें।",
    staffMessage: "Possible acute allergy / swelling of throat, lips, or respiratory involvement reported.",
    evaluate: (answers: IntakeAnswers) => {
      const allergyDetailsText = answers.allergies.details.join(" ");
      const combinedText = `${answers.mainConcern} ${allergyDetailsText} ${answers.reportedSymptoms.join(" ")}`;
      const anaphylaxisPhrases = [
        "throat swelling", "lip swelling", "tongue swelling", "airway closing", "anaphylaxis",
        "गले में सूजन", "होंठ में सूजन", "जीभ में सूजन"
      ];

      const hasSwelling = isPresentWithSafeguards(combinedText, anaphylaxisPhrases);
      const hasAllergyBreathing =
        answers.allergies.status === "reported" &&
        (combinedText.toLowerCase().includes("breathing") || combinedText.toLowerCase().includes("wheezing"));

      if (hasSwelling || hasAllergyBreathing) {
        return {
          matched: true,
          supportingField: "allergies / symptoms",
          supportingAnswer: answers.allergies.details.join(", ") || answers.mainConcern,
        };
      }
      return { matched: false, supportingField: "", supportingAnswer: "" };
    },
  },
  {
    id: "rf-high-fever-neck-stiffness",
    category: "infection",
    severity: "attention_needed",
    title: "High Fever with Stiffness or Altered Sensorium",
    patientMessageEn: "High fever with stiffness reported. Please notify the nursing station.",
    patientMessageHi: "तेज़ बुखार और जकड़न की सूचना। कृपया नर्सिंग स्टेशन को सूचित करें।",
    staffMessage: "High fever with reported neck stiffness or altered alertness. Requires clinical assessment.",
    evaluate: (answers: IntakeAnswers) => {
      const combinedText = `${answers.mainConcern} ${answers.reportedSymptoms.join(" ")}`;
      const feverPhrases = ["high fever", "fever", "तेज़ बुखार", "बुखार"];
      const stiffPhrases = ["stiff neck", "neck stiffness", "confusion", "altered sensorium", "गर्दन में अकड़न"];

      const hasFever = isPresentWithSafeguards(combinedText, feverPhrases);
      const hasStiff = isPresentWithSafeguards(combinedText, stiffPhrases);

      if (hasFever && hasStiff) {
        return {
          matched: true,
          supportingField: "reportedSymptoms",
          supportingAnswer: answers.mainConcern || answers.reportedSymptoms.join(", "),
        };
      }
      return { matched: false, supportingField: "", supportingAnswer: "" };
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