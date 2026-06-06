// Chess constants — FENs, files, piece glyphs.

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

// Unicode chess glyphs (filled set; color comes from text style).
export const GLYPH: Record<string, string> = {
  K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟',
};

export const PIECE_NAME: Record<string, string> = {
  K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn',
};

export const STD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
export const STARTING_FEN = `${STD_FEN} w KQkq - 0 1`;

// Demo positions used by the prototype art + scan flow.
// Busy Giuoco Piano (Italian) middlegame, White to move. Best = d4 break.
export const SCAN_FEN = 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N1P/PP3PP1/RNBQR1K1';
// Kasparov–Topalov, Wijk aan Zee 1999, before 24.Rxd4 (immortal rook sacrifice).
export const KT99_FEN = 'b2r3r/k4p1p/p2q1np1/NppP4/3p1Q2/P4PPB/1PP4P/1K1RR3';
