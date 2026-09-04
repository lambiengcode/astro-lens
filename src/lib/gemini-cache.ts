import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { DEFAULT_LOCALE, type Locale } from './i18n/locales';
import { getPrompt } from './prompt';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const CACHE_DISPLAY_NAME = 'astro-lens-knowledge-base';
const FILE_DISPLAY_NAME = 'astro-lens-reference-book';
const CACHE_MODEL = 'gemini-3.1-pro-preview';
// 90 days in seconds — near-permanent for this project
const CACHE_TTL = '7776000s';

// ============================================================
// PER-LOCALE CONTEXT CACHE — PLAN.md §13b.4
// ============================================================
//
// The cache bundles the reference PDF with the system instruction, and the
// system instruction is now per locale. A single cache would serve a Korean
// reader a Vietnamese preamble, so the cache is keyed by locale.
//
// This does NOT make a reading slower, which §13b.4 is explicit about:
//
//   - The PDF is uploaded ONCE and the five caches reference the same file
//     URI. `_findExistingFile` looks for it before uploading anything, so the
//     second locale to be asked for pays no upload.
//   - A cache is created once per locale and then lives for ninety days, so
//     only the very first request in a locale pays a cache creation. Every
//     request after it is a cache hit, exactly as before this phase.
//   - `vi` keeps the ORIGINAL display name, so the cache that already exists
//     in the deployed project is found and reused rather than rebuilt. The
//     default locale's ~3-minute analysis is untouched.

function displayNameFor(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? CACHE_DISPLAY_NAME : `${CACHE_DISPLAY_NAME}-${locale}`;
}

const cachedContentNames = new Map<Locale, string>();
const initPromises = new Map<Locale, Promise<string | null>>();

/**
 * Get or create the cached content name for a locale. One in-flight
 * initialisation per locale; the result is memoised for the process.
 */
export function getCachedContentName(locale: Locale = DEFAULT_LOCALE): Promise<string | null> {
  const ready = cachedContentNames.get(locale);
  if (ready) return Promise.resolve(ready);

  const inFlight = initPromises.get(locale);
  if (inFlight) return inFlight;

  const promise = _initCache(locale);
  initPromises.set(locale, promise);
  return promise;
}

async function _initCache(locale: Locale): Promise<string | null> {
  const displayName = displayNameFor(locale);
  try {
    // 1. Check if this locale's cache already exists
    const existing = await _findExistingCache(displayName);
    if (existing) {
      cachedContentNames.set(locale, existing);
      console.log('[Cache] Reusing existing cache:', locale, existing);
      return existing;
    }

    // 2. Reuse the uploaded PDF if it is already there; upload it only once.
    let readyFile = await _findExistingFile();

    if (!readyFile) {
      const pdfPath = path.join(process.cwd(), 'astro-lens.pdf');
      console.log('[Cache] Uploading PDF:', pdfPath);

      const file = await ai.files.upload({
        file: pdfPath,
        config: {
          mimeType: 'application/pdf',
          displayName: FILE_DISPLAY_NAME,
        },
      });

      console.log('[Cache] File uploaded:', file.name, 'state:', file.state);

      // 3. Wait for file to be processed (ACTIVE state)
      readyFile = await _waitForFileReady(file.name!);
      if (!readyFile) {
        console.error('[Cache] File processing failed or timed out');
        return null;
      }
    } else {
      console.log('[Cache] Reusing uploaded PDF:', readyFile.name);
    }

    // 4. This locale's system instruction and cache seed
    const pack = getPrompt(locale);

    // 5. Create cache with PDF + system instruction
    console.log('[Cache] Creating cached content for', locale, 'with TTL:', CACHE_TTL);
    const cache = await ai.caches.create({
      model: CACHE_MODEL,
      config: {
        displayName,
        ttl: CACHE_TTL,
        systemInstruction: pack.system,
        contents: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  fileUri: readyFile.uri!,
                  mimeType: 'application/pdf',
                },
              },
              { text: pack.cacheSeed },
            ],
          },
        ],
      },
    });

    const name = cache.name!;
    cachedContentNames.set(locale, name);
    console.log('[Cache] Created successfully:', locale, name);
    console.log('[Cache] Token count:', cache.usageMetadata?.totalTokenCount);
    return name;
  } catch (e) {
    console.error('[Cache] Initialization failed for', locale, e);
    initPromises.delete(locale); // Allow retry on next call
    return null;
  }
}

async function _findExistingCache(displayName: string): Promise<string | null> {
  try {
    const caches = await ai.caches.list();
    for await (const cache of caches) {
      if (cache.displayName === displayName) {
        if (cache.model?.includes('gemini-3.1-pro-preview')) {
          return cache.name ?? null;
        }
      }
    }
  } catch (e) {
    console.warn('[Cache] Failed to list caches:', e);
  }
  return null;
}

/** The uploaded reference PDF, if a previous locale already put it there. */
async function _findExistingFile(): Promise<{ uri: string; name: string } | null> {
  try {
    const files = await ai.files.list();
    for await (const file of files) {
      if (file.displayName === FILE_DISPLAY_NAME && file.state === 'ACTIVE' && file.uri) {
        return { uri: file.uri, name: file.name! };
      }
    }
  } catch (e) {
    console.warn('[Cache] Failed to list files:', e);
  }
  return null;
}

async function _waitForFileReady(
  fileName: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<{ uri: string; name: string } | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const file = await ai.files.get({ name: fileName });
    if (file.state === 'ACTIVE') {
      return { uri: file.uri!, name: file.name! };
    }
    if (file.state === 'FAILED') {
      console.error('[Cache] File processing failed:', file.error);
      return null;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.error('[Cache] File processing timed out after', maxAttempts * intervalMs / 1000, 'seconds');
  return null;
}

/** Exported for the cache-key test — PLAN.md §13b.7 item 9. */
export const _test = { displayNameFor };
