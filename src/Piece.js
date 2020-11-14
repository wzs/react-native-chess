type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type ColorType = 'white' | 'black';

export default class Piece {
  type: PieceType;
  color: ColorType;
  hasMoved = false;
  isPromoted = false;

  static new = (color: ColorType, type: PieceType): Piece => {
    const p = new Piece();
    p.color = color;
    p.type = type;

    return p;
  };

  get text(): string {
    switch (this.color) {
      case 'white':
        switch (this.type) {
          case 'king':
            return '♔';
          case 'queen':
            return '♕';
          case 'rook':
            return '♖';
          case 'bishop':
            return '♗';
          case 'knight':
            return '♘';
          case 'pawn':
            return '♙';
        }
        break;
      case 'black':
        switch (this.type) {
          case 'king':
            return '♚';
          case 'queen':
            return '♛';
          case 'rook':
            return '♜';
          case 'bishop':
            return '♝';
          case 'knight':
            return '♞';
          case 'pawn':
            return '♟';
        }
    }
  }

  get symbol(): string {
    if (this.type === 'pawn') {
      return '';
    } else {
      return this.type.charAt(0).toUpperCase();
    }
  }
}
