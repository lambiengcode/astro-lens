import { GoogleGenAI } from '@google/genai';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const CACHE_DISPLAY_NAME = 'horoscopes-knowledge-base';
const CACHE_MODEL = 'gemini-3.1-pro-preview';
// 90 days in seconds — near-permanent for this project
const CACHE_TTL = '7776000s';

let cachedContentName: string | null = null;
let initPromise: Promise<string | null> | null = null;

/**
 * Get or create the cached content name for the horoscopes PDF.
 * Uses singleton pattern — only one cache is created and reused.
 * The cache includes: PDF knowledge base + system instruction.
 */
export function getCachedContentName(): Promise<string | null> {
  if (cachedContentName) return Promise.resolve(cachedContentName);
  if (initPromise) return initPromise;
  initPromise = _initCache();
  return initPromise;
}

async function _getSystemInstruction(): Promise<string> {
  // Dynamic import to avoid circular dependency
  const { SYSTEM_INSTRUCTION } = await import('./gemini');
  return SYSTEM_INSTRUCTION;
}

async function _initCache(): Promise<string | null> {
  try {
    // 1. Check if cache already exists
    const existing = await _findExistingCache();
    if (existing) {
      cachedContentName = existing;
      console.log('[Cache] Reusing existing cache:', existing);
      return existing;
    }

    // 2. Upload PDF
    const pdfPath = path.join(process.cwd(), 'horoscopes.pdf');
    console.log('[Cache] Uploading PDF:', pdfPath);

    const file = await ai.files.upload({
      file: pdfPath,
      config: {
        mimeType: 'application/pdf',
        displayName: 'horoscopes-reference-book',
      },
    });

    console.log('[Cache] File uploaded:', file.name, 'state:', file.state);

    // 3. Wait for file to be processed (ACTIVE state)
    const readyFile = await _waitForFileReady(file.name!);
    if (!readyFile) {
      console.error('[Cache] File processing failed or timed out');
      return null;
    }

    // 4. Get system instruction to bundle into cache
    const systemInstruction = await _getSystemInstruction();

    // 5. Create cache with PDF + system instruction
    console.log('[Cache] Creating cached content with TTL:', CACHE_TTL);
    const cache = await ai.caches.create({
      model: CACHE_MODEL,
      config: {
        displayName: CACHE_DISPLAY_NAME,
        ttl: CACHE_TTL,
        systemInstruction: systemInstruction,
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
              {
                text: 'Đây là tài liệu tham khảo chuyên sâu về Tử Vi Đẩu Số. Hãy sử dụng kiến thức từ tài liệu này để phân tích lá số chính xác và chi tiết hơn. Khi phân tích, ưu tiên phương pháp và quy tắc trong tài liệu này.',
              },
            ],
          },
        ],
      },
    });

    cachedContentName = cache.name!;
    console.log('[Cache] Created successfully:', cachedContentName);
    console.log('[Cache] Token count:', cache.usageMetadata?.totalTokenCount);
    return cachedContentName;
  } catch (e) {
    console.error('[Cache] Initialization failed:', e);
    initPromise = null; // Allow retry on next call
    return null;
  }
}

async function _findExistingCache(): Promise<string | null> {
  try {
    const caches = await ai.caches.list();
    for await (const cache of caches) {
      if (cache.displayName === CACHE_DISPLAY_NAME) {
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
