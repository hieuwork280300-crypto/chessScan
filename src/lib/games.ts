// Saved games — real persistence (AsyncStorage) + helpers for thumbnails and opening a game.

import { router } from 'expo-router';
import { loadGames, saveGames } from '@/lib/storage';
import { setScan } from '@/lib/scanStore';
import { fenToPos, computeLinePositions } from '@/lib/board';
import { STD_FEN } from '@/constants/chess';
import type { Position, SavedGame } from '@/types/chess';

export { loadGames };

// Load a saved game into the scan store and open the review screen.
export function openGame(g: SavedGame): void {
  if (g.type === 'S') setScan({ mode: 'sheet', plies: g.plies ?? [], result: g.result });
  else setScan({ mode: 'position', fen: g.startFen });
  router.push({
    pathname: '/review',
    params: {
      mode: g.type === 'P' ? 'position' : 'sheet',
      title: g.title,
      ...(g.type === 'P' && g.startFen ? { fen: g.startFen } : {}),
    },
  });
}

export function shortDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function newGameId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export async function addGame(g: SavedGame): Promise<void> {
  const games = await loadGames();
  games.unshift(g);
  await saveGames(games);
}

export async function deleteGame(id: string): Promise<SavedGame[]> {
  const games = (await loadGames()).filter((g) => g.id !== id);
  await saveGames(games);
  return games;
}

// Board thumbnail for a saved game: final position for a sheet, the scanned FEN for a position.
export function boardForGame(g: SavedGame): { pos: Position; arrow?: [string, string] } {
  if (g.type === 'S' && g.plies && g.plies.length) {
    const positions = computeLinePositions(fenToPos(STD_FEN), g.plies);
    return { pos: positions[positions.length - 1] };
  }
  if (g.startFen) return { pos: fenToPos(g.startFen) };
  return { pos: fenToPos(STD_FEN) };
}
