export type PlayerSide = "white" | "black";
export type Side = "white" | "black";
export type GameStatus = "ongoing" | "check" | "checkmate" | "stalemate";

export interface GameState {
  // опционально:
  // gameId?: string;
  fen: string;
  sideToMove: Side;
  status: GameStatus;
  history: string[];
  lastMove?: { from: string; to: string };
}

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// старт новой партии
export async function startGame(mode: PlayerSide): Promise<GameState> {
  const response = await fetch(`${API_URL}/api/start-game`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerSide: mode }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start game: ${response.status}`);
  }

  const data = (await response.json()) as GameState;
  return data;
}

// ход игрока
export async function makePlayerMove(
  mode: PlayerSide,
  from: string,
  to: string,
  promotion: "q" | "r" | "b" | "n" = "q"
): Promise<GameState> {
  const response = await fetch(`${API_URL}/api/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerSide: mode,
      from,
      to,
      promotion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to make move: ${response.status}`);
  }

  const data = (await response.json()) as GameState;
  return data;
}
