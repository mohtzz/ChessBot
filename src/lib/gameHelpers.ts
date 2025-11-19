import { Chess, type Square } from "chess.js";
import type { CSSProperties } from "react";
import type { PlayerSide, GameStatus } from "./apiClient";

// ----------------------------
// Подсчёт подсветки возможных ходов для клетки.
// Возвращает объект: square -> CSS стиль.
// ----------------------------
export function getMoveHighlightStyles(
  fen: string,
  square: string,
  playerSide: PlayerSide,
  status: GameStatus
): Record<string, CSSProperties> {
  if (!fen) return {};
  if (status !== "ongoing" && status !== "check") return {};

  const game = new Chess(fen);
  const piece = game.get(square as Square);

  if (!piece) return {};

  // подсвечиваем только фигуры той стороны, чей ход
  if (piece.color !== game.turn()) return {};

  // и только фигуры игрока
  const allowedColor = playerSide === "white" ? "w" : "b";
  if (piece.color !== allowedColor) return {};

  const moves = game.moves({ square: square as Square, verbose: true }) as any[];
  if (!moves.length) return {};

  const highlightStyles: Record<string, CSSProperties> = {};

  for (const m of moves) {
    const to: string | undefined = m.to;
    if (!to || typeof to !== "string") continue;

    const flags: string = typeof m.flags === "string" ? m.flags : "";

    if (flags.includes("c")) {
      // взятие: бледно-зелёная рамка
      highlightStyles[to] = {
        outline: "3px solid rgba(110, 231, 183, 0.5)",
        outlineOffset: "-3px",
      };
    } else {
      // обычный ход: маленькая бледно-зелёная точка
      highlightStyles[to] = {
        background:
          "radial-gradient(circle, rgba(110,231,183,0.4) 0%, rgba(110,231,183,0.4) 25%, transparent 26%)",
      };
    }
  }

  return highlightStyles;
}

// ----------------------------
//Проверка: валиден ли ход, и является ли он промоцией пешки.
// ----------------------------
export function isMoveLegalAndPromotion(
  fen: string,
  from: string,
  to: string,
  playerSide: PlayerSide,
  status: GameStatus
): { legal: boolean; isPromotion: boolean } {
  if (!fen) return { legal: false, isPromotion: false };
  if (status === "checkmate" || status === "stalemate") {
    return { legal: false, isPromotion: false };
  }

  const game = new Chess(fen);
  const piece = game.get(from as Square);

  if (!piece) return { legal: false, isPromotion: false };

  // ход не той стороной, чей сейчас ход
  if (piece.color !== game.turn()) {
    return { legal: false, isPromotion: false };
  }

  // ход не своей фигурой
  const allowedColor = playerSide === "white" ? "w" : "b";
  if (piece.color !== allowedColor) {
    return { legal: false, isPromotion: false };
  }

  // определяем, промоция ли это
  let isPromotion = false;
  if (piece.type === "p") {
    const targetRank = to[1];
    if (piece.color === "w" && targetRank === "8") isPromotion = true;
    if (piece.color === "b" && targetRank === "1") isPromotion = true;
  }

  // тестовый ход (с промоцией в ферзя) только для проверки легальности from→to
  try {
    const res = game.move({
      from,
      to,
      promotion: "q",
    } as any);

    if (!res) {
      return { legal: false, isPromotion: false };
    }
  } catch {
    return { legal: false, isPromotion: false };
  }

  return { legal: true, isPromotion };
}
