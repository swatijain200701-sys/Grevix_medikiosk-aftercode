import { NextResponse } from 'next/server';

export async function GET() {
  const geminiAvailable = !!process.env.GEMINI_API_KEY;
  const openaiAvailable = !!process.env.OPENAI_API_KEY;
  const groqAvailable = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    aiConfigured: geminiAvailable || openaiAvailable || groqAvailable,
    activeProvider: geminiAvailable ? 'Google Gemini' : openaiAvailable ? 'OpenAI' : groqAvailable ? 'Groq' : 'None (Template Intake Only)',
    capabilities: {
      voiceTranscription: 'Web Speech API + Local Audio Fallback',
      ocrExtraction: 'Local Canvas + Client OCR',
      structuredSummarization: geminiAvailable || openaiAvailable || groqAvailable ? 'Live LLM Provider' : 'Pending API Key',
      offlinePersistence: 'IndexedDB (Dexie) + Web Crypto',
      serverStorage: 'SQLite WAL Mode',
    },
  });
}