// Engine abstraction — one interface, swappable backends (WASM WebView, Lichess, native).

import type { MultiPVLine } from '@/types/chess';

export interface AnalyzeOptions {
  multipv?: number; // default 3
  depth?: number;   // default 16
  signal?: AbortSignal;
}

export interface EngineResult {
  fen: string;
  lines: MultiPVLine[]; // sorted best→worst, evals from White's perspective
  source: 'wasm' | 'lichess' | 'mock';
  depth: number;
}

export interface ChessEngine {
  analyze(fen: string, opts?: AnalyzeOptions): Promise<EngineResult>;
}
