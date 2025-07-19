import { pinata } from "./config";
//so in your previous code u were using pinata.files.list() to get all the pinned files it is slower
// so i suggest for local testing  lets use pinataCache.ts
// Simple in-memory cache for Pinata files.list results
// This avoids calling the full listing endpoint on every request which can
// be slow if the account has many pinned files
// NOTE:  In a real production environment you should use a shared cache like
// Redis or Upstash KV instead of an in-memory module variable 

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

let cachedFiles: Awaited<ReturnType<typeof pinata.files.list>> | null = null;
let lastFetch = 0;

export async function getPinnedFiles(forceRefresh = false) {
  if (!forceRefresh && cachedFiles && Date.now() - lastFetch < CACHE_TTL_MS) {
    return cachedFiles;
  }
  cachedFiles = await pinata.files.list();
  lastFetch = Date.now();
  return cachedFiles;
}
