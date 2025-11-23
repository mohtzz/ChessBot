package com.broadcom.tanzu.demos.chessai;

import io.github.wolfraam.chessgame.ChessGame;

record Board(
        String id,
        ChessGame game,
        String currentSquare,
        Error error
) {
    enum Error {
        SERVER_ERROR,
        ILLEGAL_MOVE_FROM_AI,
        UNABLE_TO_GUESS_NEXT_MOVE,
        CHECK_MATE
    }
}
