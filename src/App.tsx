import { useState, type CSSProperties } from "react";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";

import {
  startGame as apiStartGame,
  makePlayerMove as apiMakeMove,
  type PlayerSide,
  type Side,
  type GameStatus,
} from "./lib/apiClient";

import { getMoveHighlightStyles, isMoveLegalAndPromotion } from "./lib/gameHelpers";
import { MoveList } from "./components/MoveList";

type PromotionPiece = "q" | "r" | "b" | "n";

function App() {
  const [playerSide, setPlayerSide] = useState<PlayerSide>("white");
  const [position, setPosition] = useState<string>(""); // FEN
  const [sideToMove, setSideToMove] = useState<Side>("white");
  const [gameStatus, setGameStatus] = useState<GameStatus>("ongoing");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const [highlightedSquares, setHighlightedSquares] = useState<
    Record<string, CSSProperties>
  >({});
  const [lastMoveSquares, setLastMoveSquares] = useState<
    Record<string, CSSProperties>
  >({});

  // ожидаем промоцию пешки
  const [pendingPromotion, setPendingPromotion] = useState<
    { from: string; to: string } | null
  >(null);

  function playMoveSound() {
    const audio = new Audio("/move.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }

  // старт новой партии в нужном режиме (белые / чёрные)
  async function start(mode: PlayerSide) {
    setPlayerSide(mode);
    const state = await apiStartGame(mode);

    setPosition(state.fen);
    setSideToMove(state.sideToMove);
    setGameStatus(state.status);
    setMoveHistory(state.history);

    setHighlightedSquares({});
    setLastMoveSquares({});
    setPendingPromotion(null);
  }

  // ----------------------------
  // Подсветка возможных ходов
  // ----------------------------
  function handleMouseOverSquare({ square }: SquareHandlerArgs) {
    const styles = getMoveHighlightStyles(position, square, playerSide, gameStatus);
    setHighlightedSquares(styles);
  }

  function handleMouseOutSquare(_: SquareHandlerArgs) {
    setHighlightedSquares({});
  }

  // ----------------------------
  // Обработка хода игрока
  // ----------------------------
  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean {
    if (pendingPromotion) {
      // пока не выбрали фигуру для прошлой промоции — новые ходы запрещаем
      return false;
    }

    if (!sourceSquare || !targetSquare) return false;

    const { legal, isPromotion } = isMoveLegalAndPromotion(
      position,
      sourceSquare,
      targetSquare,
      playerSide,
      gameStatus
    );

    if (!legal) {
      return false;
    }

    // если это промоция — не шлём ход сразу, а ждём выбор фигуры
    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      setHighlightedSquares({});
      return true;
    }

    // обычный ход — сразу отправляем на "сервер"
    apiMakeMove(playerSide, sourceSquare, targetSquare, "q")
      .then((state) => {
        setPosition(state.fen);
        setSideToMove(state.sideToMove);
        setGameStatus(state.status);
        setMoveHistory(state.history);

        if (state.lastMove) {
          setLastMoveSquares({
            [state.lastMove.from]: {
              background: "rgba(252, 211, 77, 0.7)",
            },
            [state.lastMove.to]: {
              background: "rgba(252, 211, 77, 0.7)",
            },
          });
        } else {
          setLastMoveSquares({});
        }

        setHighlightedSquares({});
        playMoveSound();
      })
      .catch(() => {});

    return true;
  }

  // обработка выбора фигуры для промоции
  function handlePromotionChoice(piece: PromotionPiece) {
    if (!pendingPromotion) return;

    const { from, to } = pendingPromotion;

    apiMakeMove(playerSide, from, to, piece)
      .then((state) => {
        setPosition(state.fen);
        setSideToMove(state.sideToMove);
        setGameStatus(state.status);
        setMoveHistory(state.history);

        if (state.lastMove) {
          setLastMoveSquares({
            [state.lastMove.from]: {
              background: "rgba(252, 211, 77, 0.7)",
            },
            [state.lastMove.to]: {
              background: "rgba(252, 211, 77, 0.7)",
            },
          });
        } else {
          setLastMoveSquares({});
        }

        setHighlightedSquares({});
        playMoveSound();
      })
      .catch(() => {})
      .finally(() => {
        setPendingPromotion(null);
      });
  }

  // ----------------------------
  // Рендер
  // ----------------------------
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(95vw, 1000px)",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        {/* Левая часть: заголовок, статус, режимы, доска */}
        <div>
          <h1
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "6px",
              fontSize: "20px",
              fontFamily: "system-ui",
            }}
          >
            Chess Grandmaster Bot
          </h1>

          <p
            style={{
              color: "#e5e7eb",
              textAlign: "center",
              marginBottom: "4px",
            }}
          >
            Ход: <strong>{sideToMove === "white" ? "белые" : "чёрные"}</strong>
          </p>

          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "13px",
            }}
          >
            Состояние:{" "}
            <strong>
              {
                {
                  ongoing: "идёт игра",
                  check: "шах",
                  checkmate: "мат",
                  stalemate: "пат",
                }[gameStatus]
              }
            </strong>
          </p>

          {/* Кнопки выбора режима */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => start("white")}
              style={{
                padding: "4px 10px",
                borderRadius: "9999px",
                border: "1px solid #4b5563",
                background:
                  playerSide === "white" ? "#e5e7eb" : "#111827",
                color:
                  playerSide === "white" ? "#111827" : "#e5e7eb",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Белые
            </button>

            <button
              onClick={() => start("black")}
              style={{
                padding: "4px 10px",
                borderRadius: "9999px",
                border: "1px solid #4b5563",
                background:
                  playerSide === "black" ? "#e5e7eb" : "#111827",
                color:
                  playerSide === "black" ? "#111827" : "#e5e7eb",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Чёрные
            </button>
          </div>

          {/* Панель выбора фигуры при промоции */}
          {pendingPromotion && (
            <div
              style={{
                marginBottom: "10px",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #4b5563",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "6px",
                justifyContent: "center",
              }}
            >
              <span>Превратить пешку в:</span>
              <button
                onClick={() => handlePromotionChoice("q")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  border: "1px solid #fbbf24",
                  background: "#111827",
                  color: "#fbbf24",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Ферзь
              </button>
              <button
                onClick={() => handlePromotionChoice("r")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  border: "1px solid #e5e7eb",
                  background: "#111827",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Ладья
              </button>
              <button
                onClick={() => handlePromotionChoice("b")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  border: "1px solid #a5b4fc",
                  background: "#111827",
                  color: "#a5b4fc",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Слон
              </button>
              <button
                onClick={() => handlePromotionChoice("n")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  border: "1px solid #f472b6",
                  background: "#111827",
                  color: "#f472b6",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Конь
              </button>
            </div>
          )}

          <Chessboard
            options={{
              id: "main-board",
              position,
              onPieceDrop: handlePieceDrop,
              squareStyles: {
                ...lastMoveSquares,
                ...highlightedSquares,
              },
              onMouseOverSquare: handleMouseOverSquare,
              onMouseOutSquare: handleMouseOutSquare,
              draggingPieceGhostStyle: {
                opacity: 0,
              },
              boardOrientation:
                playerSide === "black" ? "black" : "white",
            }}
          />
        </div>

        {/* Правая часть: история ходов */}
        <MoveList moves={moveHistory} />
      </div>
    </div>
  );
}

export default App;
