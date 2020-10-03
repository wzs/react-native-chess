import Piece from './Piece';
import type {ColorType} from './Piece';

type BoardRow = Array<?Piece>;

type Field = [number, number];
type MoveResult = 'move' | 'captured' | 'promotion' | 'impossible' | 'own';

export default class Board {
  rows: Array<BoardRow>;

  constructor() {
    this.rows = this.initialState();
  }

  pieceAt = (field: Field): Piece => {
    return this.rows[field[0]][field[1]];
  };

  isChecked = (): boolean => {
    //TODO
    const findKing = (color: ColorType): Field => {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; i < 8; i++) {
          const piece = this.pieceAt([i, j]);
          if (piece?.type === 'king' && piece?.color === color) {
            return [i, j];
          }
        }
      }
      console.error('No king, no fun');
    };

    findKing('black');
  };

  move = (from: Field, to: Field): MoveResult => {
    const piece = this.pieceAt(from);

    if (piece && this.canMove(piece, from, to)) {
      const pieceAtDestination = this.pieceAt(to);

      if (
        pieceAtDestination != null &&
        pieceAtDestination.color === piece.color
      ) {
        return 'impossible';
      } else {
        piece.hasMoved = true;
        this.rows[to[0]][to[1]] = piece;
        this.rows[from[0]][from[1]] = null;

        if (piece.type === 'pawn' && (to[0] === 0 || to[0] === 7)) {
          piece.type = 'queen';
          return 'promotion';
        }

        return pieceAtDestination ? 'captured' : 'move';
      }
    } else if (this.pieceAt(to)?.color === piece.color) {
      return 'own';
    } else {
      return 'impossible';
    }
  };

  canMove = (piece: Piece, from: Field, to: Field): boolean => {
    if (this.pieceAt(to)?.color === piece.color) {
      return false;
    }

    const v = from[0] - to[0];
    const h = from[1] - to[1];
    const dh = Math.abs(h);
    const dv = Math.abs(v);

    const canRookMove = () => {
      if (dh !== 0 && dv !== 0) {
        return false;
      }

      const idx = dv > 0 ? 0 : 1;
      const dir = (idx ? h : v) > 0 ? 1 : -1;
      for (let i = from[idx] - dir; (i - to[idx]) * dir > 0; i -= dir) {
        const field = dv > 0 ? [i, from[1]] : [from[0], i];
        if (this.pieceAt(field)) {
          return false;
        }
      }

      return true;
    };

    const canBishopMove = () => {
      if (dh !== dv) {
        return false;
      }

      const vMulti = v < 0 ? 1 : -1;
      const hMulti = h < 0 ? 1 : -1;

      for (let i = 1; i < dv; i++) {
        const field = [from[0] + i * vMulti, from[1] + i * hMulti];
        if (this.pieceAt(field)) {
          return false;
        }
      }
      return true;
    };

    switch (piece.type) {
      case 'king':
        //TODO: add conditions for checks
        return dh <= 1 && dv <= 1;
      case 'queen':
        return canRookMove() || canBishopMove();
      case 'rook':
        return canRookMove();
      case 'bishop':
        return canBishopMove();
      case 'knight':
        return (dh === 2 && dv === 1) || (dh === 1 && dv === 2);
      case 'pawn':
        const dir = piece.color === 'white' ? 1 : -1;
        const adv = v * dir;
        if (dh === 1 && adv === 1) {
          return this.pieceAt(to) != null;
        }

        if (dh > 0) {
          return false;
        }

        if (adv === 2 && !piece.hasMoved) {
          if (this.pieceAt([from[0] - dir, from[1]])) {
            return false;
          }
        } else if (adv !== 1) {
          return false;
        }
        return this.pieceAt(to) == null;
      default:
        return false;
    }
  };

  initialRow = (color: ColorType): BoardRow => {
    return [
      Piece.new(color, 'rook'),
      Piece.new(color, 'knight'),
      Piece.new(color, 'bishop'),
      Piece.new(color, 'queen'),
      Piece.new(color, 'king'),
      Piece.new(color, 'bishop'),
      Piece.new(color, 'knight'),
      Piece.new(color, 'rook'),
    ];
  };

  pawnRow = (color: ColorType): BoardRow => {
    return [...Array(8).keys()].map((i) => Piece.new(color, 'pawn'));
  };

  initialState = (): Array<BoardRow> => {
    const board = [...Array(8).keys()].map(() =>
      [...Array(8).keys()].map((_) => null),
    );

    board[0] = this.initialRow('black');
    board[1] = this.pawnRow('black');
    board[6] = this.pawnRow('white');
    board[7] = this.initialRow('white');

    return board;
  };
}
