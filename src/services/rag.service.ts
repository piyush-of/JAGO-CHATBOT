import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

interface Chunk {
  source: string;
  heading: string;
  text: string;
  tokens: string[];
  vector?: number[];
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;
let chunks: Chunk[] = [];
let vectorsReady = false;

const tokenize = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((t) => t.length > 2);

// Split each markdown file by "## " sections so every chunk keeps its heading.
function chunkMarkdown(file: string, md: string): Chunk[] {
  const title = md.match(/^# (.+)$/m)?.[1] ?? file;
  return md.split(/^## /m).slice(1).map((section) => {
    const [h, ...rest] = section.split("\n");
    const text = `${title} - ${h.trim()}\n${rest.join("\n").trim()}`;
    return { source: title, heading: h.trim(), text, tokens: tokenize(text) };
  });
}

export async function initKnowledge() {
  const files = (await readdir(KNOWLEDGE_DIR)).filter((f) => f.endsWith(".md"));
  chunks = [];
  for (const f of files) {
    chunks.push(...chunkMarkdown(f, await readFile(path.join(KNOWLEDGE_DIR, f), "utf8")));
  }
  console.log(`[rag] loaded ${chunks.length} chunks from ${files.length} documents`);

  if (ai) {
    try {
      const res = await ai.models.embedContent({
        model: env.geminiEmbedModel,
        contents: chunks.map((c) => c.text),
        config: { taskType: "RETRIEVAL_DOCUMENT" }
      });
      res.embeddings?.forEach((e, i) => (chunks[i].vector = e.values));
      vectorsReady = chunks.every((c) => c.vector?.length);
      console.log(`[rag] semantic search ${vectorsReady ? "enabled" : "unavailable, using keyword search"}`);
    } catch (err) {
      console.warn("[rag] embeddings failed, using keyword search:", (err as Error).message);
    }
  }
}

const cosine = (a: number[], b: number[]) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

function keywordScore(q: string[], c: Chunk) {
  const set = new Set(c.tokens);
  return q.reduce((s, t) => s + (set.has(t) ? 1 : 0), 0) / Math.sqrt(c.tokens.length || 1);
}

export async function searchKnowledge(query: string, k = 3) {
  let scored: { chunk: Chunk; score: number }[];
  if (vectorsReady && ai) {
    try {
      const res = await ai.models.embedContent({
        model: env.geminiEmbedModel,
        contents: [query],
        config: { taskType: "RETRIEVAL_QUERY" }
      });
      const qv = res.embeddings![0].values!;
      scored = chunks.map((chunk) => ({ chunk, score: cosine(qv, chunk.vector!) }));
    } catch {
      vectorsReady = false;
    }
  }
  scored ??= (() => {
    const q = tokenize(query);
    return chunks.map((chunk) => ({ chunk, score: keywordScore(q, chunk) }));
  })();
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter((s) => s.score > 0)
    .map((s) => ({ source: s.chunk.source, section: s.chunk.heading, content: s.chunk.text }));
}
