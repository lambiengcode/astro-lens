import { GoogleGenAI } from '@google/genai';

// The model the app actually calls — counting against a different one would
// measure a different tokeniser.
const MODEL = 'gemini-3.1-pro-preview';

let client: GoogleGenAI | null = null;

/**
 * Real token count for a fully assembled prompt, from the provider's own
 * tokeniser. P6 Part B requires exact numbers rather than impressions, and a
 * local character-count heuristic is exactly the impression it warns against —
 * CJK, Latin and the box-drawing characters in this prompt tokenise very
 * differently from one another.
 *
 * Returns `null` rather than throwing when the API is unavailable, so a token
 * measurement never sinks a reading-quality run.
 */
export async function countPromptTokens(prompt: string): Promise<number | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const r = await client.models.countTokens({ model: MODEL, contents: prompt });
    return r.totalTokens ?? null;
  } catch (e) {
    console.warn('  countTokens failed:', e instanceof Error ? e.message : String(e));
    return null;
  }
}
