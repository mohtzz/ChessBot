/*
 * Copyright (c) 2025 Broadcom, Inc. or its affiliates
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.broadcom.tanzu.demos.chessai;

import io.github.wolfraam.chessgame.board.Piece;
import io.github.wolfraam.chessgame.board.PieceType;
import io.github.wolfraam.chessgame.board.Square;
import io.github.wolfraam.chessgame.move.Move;
import io.github.wolfraam.chessgame.notation.NotationType;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
class BoardFormatter {

    private final Map<Piece, String> piece2String = new HashMap<>(12);

    BoardFormatter() {
        
        piece2String.put(Piece.WHITE_PAWN, "piece piece-w-pawn");
        piece2String.put(Piece.WHITE_KNIGHT, "piece piece-w-knight");
        piece2String.put(Piece.WHITE_BISHOP, "piece piece-w-bishop");
        piece2String.put(Piece.WHITE_ROOK, "piece piece-w-rook");
        piece2String.put(Piece.WHITE_QUEEN, "piece piece-w-queen");
        piece2String.put(Piece.WHITE_KING, "piece piece-w-king");

        piece2String.put(Piece.BLACK_PAWN, "piece piece-b-pawn");
        piece2String.put(Piece.BLACK_KNIGHT, "piece piece-b-knight");
        piece2String.put(Piece.BLACK_BISHOP, "piece piece-b-bishop");
        piece2String.put(Piece.BLACK_ROOK, "piece piece-b-rook");
        piece2String.put(Piece.BLACK_QUEEN, "piece piece-b-queen");
        piece2String.put(Piece.BLACK_KING, "piece piece-b-king");

    }

    public String formatPiece(Board board, int row, int col) {
        return piece2String.get(board.game().getPiece((Square.fromCoordinates(col - 1, row - 1))));
    }

    public String formatSquare(int row, int col) {
        return Square.fromCoordinates(col - 1, row - 1).name;
    }

    public boolean isLegalMove(Board board, int row, int col) {
        if (board.currentSquare() == null) {
            return false;
        }
        return board.game().isLegalMove(
                new Move(Square.fromName(board.currentSquare()),
                        Square.fromCoordinates(col - 1, row - 1)));
    }

    public boolean isKingAttacked(Board board, int row, int col) {
        if (!board.game().isKingAttacked()) {
            return false;
        }
        final var piece = board.game().getPiece((Square.fromCoordinates(col - 1, row - 1)));
        if (piece == null) {
            return false;
        }
        return piece.pieceType.equals(PieceType.KING)
                && board.game().getSideToMove().equals(piece.side);
    }

    public String formatLastMove(Board board) {
        if (board.game().getLastMove() == null) {
            return null;
        }
        return board.game().getNotationList(NotationType.UCI).getLast();
    }

    public String formatMovesToCopy(Board board) {
        return board.game().getFen();
    }

    public char formatColumnNumber(int col) {
        return "abcdefgh".charAt(col - 1);
    }

    public String getSquareBackgroundClass(Board board, int row, int col) {
        // Find out the CSS background class to use for a square.
        // Much better to have this code in Java rather than a Thymeleaf script for better readability!
        final var sq = Square.fromCoordinates(col - 1, row - 1);
        if (sq.name.equals(board.currentSquare())) {
            return "current";
        }
        if (isKingAttacked(board, row, col)) {
            return "king-attacked";
        }
        final var lastMove = board.game().getLastMove();
        if (lastMove != null && (sq.equals(lastMove.from) || sq.equals(lastMove.to))) {
            return "last-move";
        }
        return col % 2 == 0 ? (row % 2 == 0 ? "dark" : "light") : (row % 2 == 1 ? "dark" : "light");
    }
}
