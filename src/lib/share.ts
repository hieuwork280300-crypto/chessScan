// Share helpers — export a PGN file via the native share sheet, copy text to clipboard.

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { buildPGN } from '@/lib/pgn';
import type { SavedGame } from '@/types/chess';

export async function sharePGN(game: SavedGame, filename = 'chess-scan-game.pgn'): Promise<boolean> {
  try {
    const pgn = buildPGN(game);
    const uri = (FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '') + filename;
    await FileSystem.writeAsStringAsync(uri, pgn);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/x-chess-pgn', dialogTitle: 'Export PGN', UTI: 'public.chess-pgn' });
      return true;
    }
    await Clipboard.setStringAsync(pgn);
    return true;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<void> {
  try {
    await Clipboard.setStringAsync(text);
  } catch {
    /* no-op */
  }
}
