import Piece from './Piece';
import type {ColorType} from './Piece';

type BoardRow = Array<?Piece>;

type Field = [number, number];

const deepClone = (items) => JSON.parse(JSON.stringify(items));

export default class Board {
  rows: Array<BoardRow>;

  constructor(rows?: Array<BoardRow>) {
    this.rows = rows ? deepClone(rows) : this.initialState();
  }

  pieceAt = (field: Field): ?Piece => {
    return this.rows[field[0]][field[1]];
  };

  possibleMoves = (piece: Piece, from: Field): [?Field] => {
    return this.allFields().filter((to) => this.isValidMove(piece, from, to));
  };

  hasPossibleMove = (piece: Piece, from: Field): boolean => {
    return this.allFields().some((to) => this.isValidMove(piece, from, to));
  };

  hasAnyPossibleMoves = (color: ColorType): boolean => {
    return !this.allFields().some((position) => {
      const piece = this.pieceAt(position);
      if (!piece || piece.color !== color) {
        return false;
      }
      return this.hasPossibleMove(piece, position);
    });
  };

  fieldDescription = (field: Field): string => {
    return String.fromCharCode(97 + field[1]) + (8 - field[0]).toString();
  };

  move = (from: Field, to: Field, isValid?: boolean): ?string => {
    const piece = this.pieceAt(from);

    if (piece && (isValid ?? this.isValidMove(piece, from, to))) {
      const pieceAtDestination = this.pieceAt(to);

      if (
        pieceAtDestination != null &&
        pieceAtDestination.color === piece.color
      ) {
        return null;
      } else {
        piece.hasMoved = true;
        this.rows[to[0]][to[1]] = piece;
        this.rows[from[0]][from[1]] = null;

        if (piece.type === 'pawn' && (to[0] === 0 || to[0] === 7)) {
          const oldSymbol = piece.symbol;
          piece.type = 'queen';
          piece.isPromoted = true;
          return oldSymbol + this.fieldDescription(from) + '=' + piece.symbol;
        }

        const move =
          piece.symbol +
          this.fieldDescription(from) +
          '-' +
          this.fieldDescription(to);

        const otherPlayerColor = piece.color === 'white' ? 'black' : 'white';
        const kingPosition = this.findKing(otherPlayerColor);
        if (isValid !== true) {
          const hasAnyPossibleMoves = this.hasAnyPossibleMoves(
            otherPlayerColor,
          );

          if (this.isUnderAttack(kingPosition, otherPlayerColor)) {
            if (hasAnyPossibleMoves) {
              return move + 'X';
            } else {
              return move + '+';
            }
          } else if (hasAnyPossibleMoves) {
            return move + '=';
          }
        }

        return pieceAtDestination ? move.replace('-', ':') : move;
      }
    } else {
      return null;
    }
  };

  findKing = (color: ColorType): Field => {
    return this.allFields().find((f) => {
      const piece = this.pieceAt(f);
      return piece?.type === 'king' && piece?.color === color;
    });
  };

  allFields = (): [Field] => {
    const fields = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        fields.push([i, j]);
      }
    }
    return fields;
  };

  isUnderAttack = (field: Field, color: ColorType): boolean => {
    const checker = this.allFields().find((position) => {
      const piece = this.pieceAt(position);
      if (!piece || piece.color === color) {
        return false;
      }
      return this.isValidMove(piece, position, field);
    });

    return checker != null;
  };

  canMove = (piece: Piece, from: Field, to: Field): boolean => {
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

    const canKnightMove = () => {
      return (dh === 2 && dv === 1) || (dh === 1 && dv === 2);
    };

    switch (piece.type) {
      case 'king':
        return dh <= 1 && dv <= 1 && !this.isUnderAttack(to, piece.color);
      case 'queen':
        return (
          canRookMove() ||
          canBishopMove() ||
          (piece.isPromoted && canKnightMove())
        );
      case 'rook':
        return canRookMove();
      case 'bishop':
        return canBishopMove();
      case 'knight':
        return canKnightMove();
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

  isValidMove = (piece: Piece, from: Field, to: Field): boolean => {
    if (!to) {
      return false;
    }

    if (this.pieceAt(to)?.color === piece.color) {
      return false;
    }

    if (!this.canMove(piece, from, to)) {
      return false;
    }

    const b = new Board(this.rows);
    b.move(from, to, true);
    const king = b.findKing(piece.color);
    if (!king) {
      return true;
    }

    return !b.isUnderAttack(king, piece.color);
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
