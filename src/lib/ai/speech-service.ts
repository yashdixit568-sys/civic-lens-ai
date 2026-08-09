import { analyzeTextNLU } from './nlu-service';
import { AIAnalysisResult } from '../types';

export interface SpeechToTextResult {
  rawTranscript: string;
  detectedLanguage: 'Hindi' | 'English' | 'Hinglish';
  structuredTitle: string;
  structuredDescription: string;
  aiAnalysis: AIAnalysisResult;
}

/**
 * Processes spoken audio or speech input transcript (Hindi / Hinglish / English)
 * into a formal, structured civic complaint.
 */
export async function processSpeechInput(audioTranscript: string): Promise<SpeechToTextResult> {
  await new Promise((res) => setTimeout(res, 700));

  const textLower = audioTranscript.toLowerCase();
  
  let detectedLanguage: 'Hindi' | 'English' | 'Hinglish' = 'English';
  if (/bhai|sadak|kharab|gaddha|paani|kachra|bijli|roshni|andhera|nal|gali/i.test(textLower)) {
    detectedLanguage = 'Hinglish';
  }

  const nluResult = await analyzeTextNLU(audioTranscript);

  return {
    rawTranscript: audioTranscript,
    detectedLanguage,
    structuredTitle: nluResult.formalTitle,
    structuredDescription: nluResult.formalDescription,
    aiAnalysis: nluResult.aiAnalysis,
  };
}
