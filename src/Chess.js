import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Board from './Board';
import type {ColorType} from './Piece';
import type {MoveResult} from './Board';

type AppState = {
  currentColor: ColorType,
  selectedField: ?[number, number],
  status: ?MoveResult,
};

export default class Chess extends React.Component<{}, AppState> {
  board: Board = new Board();

  constructor(props) {
    super(props);

    this.state = {
      currentColor: 'white',
      selectedField: null,
      status: null,
    };
  }

  onFieldSelected = (field: [number, number]) => {
    this.setState((prevState: AppState) => {
      if (!prevState.selectedField) {
        if (
          this.board.pieceAt(field) &&
          this.board.pieceAt(field)?.color !== this.state.currentColor
        ) {
          return {
            selectedField: prevState.selectedField,
          };
        }

        return {
          selectedField: this.board.pieceAt(field) ? field : null,
        };
      }

      if (!this.board.pieceAt(prevState.selectedField)) {
        return {
          selectedField: field,
        };
      }

      const status = this.board.move(prevState.selectedField, field);

      const isSuccess = [
        'move',
        'captured',
        'promotion',
        'check',
        'checkmate',
      ].includes(status);
      const nextField = isSuccess
        ? null
        : status === 'own'
        ? field
        : prevState.selectedField;

      const nextColor = isSuccess
        ? prevState.currentColor === 'white'
          ? 'black'
          : 'white'
        : prevState.currentColor;

      return {
        selectedField: nextField,
        currentColor: nextColor,
        status: status,
      };
    });
  };

  pieceStyle = (field: [number, number]): any => {
    const [i, j] = field;
    let isPossibleMove = false;
    if (this.state.selectedField != null) {
      const piece = this.board.pieceAt(this.state.selectedField);
      if (piece != null) {
        isPossibleMove = this.board.isValidMove(
          piece,
          this.state.selectedField,
          field,
        );
      }
    }

    return [
      styles.piece,
      this.state.selectedField &&
      i === this.state.selectedField[0] &&
      j === this.state.selectedField[1]
        ? styles.selected
        : null,
      isPossibleMove ? styles.possible : null,
    ];
  };

  cellStyle = (field: [number, number]): any => {
    return [(field[0] + field[1]) % 2 === 0 ? styles.cell1 : styles.cell2];
  };

  render() {
    return (
      <View style={styles.container}>
        {this.board.rows.map((row, i) => {
          return (
            <View key={i} style={styles.row}>
              {row.map((e, j) => (
                <TouchableOpacity
                  key={j}
                  onPress={() => this.onFieldSelected([i, j])}
                  style={this.cellStyle([i, j])}
                  activeOpacity={1}>
                  <Text style={this.pieceStyle([i, j])}>{e?.text ?? ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <Text>Current move: {this.state.currentColor}</Text>
        <Text>{this.state.status ?? '-'}</Text>
        <Text
          style={{
            backgroundColor: 'orange',
            width: 50,
            textAlign: 'center',
            marginTop: 8,
          }}
          onPress={() => {
            this.board.rows = this.board.initialState();
            this.setState({
              selectedField: null,
              currentColor: 'white',
              status: null,
            });
          }}>
          Reset
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 400,
    height: 400,
    backgroundColor: 'white',
    marginHorizontal: 'auto',
    marginTop: 60,
  },
  row: {
    flexDirection: 'row',
  },
  piece: {
    textAlign: 'center',
    fontSize: 30,
    width: 50,
    height: 50,
  },
  cell1: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cell2: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  selected: {
    backgroundColor: 'rgba(255, 255, 0, 1)',
  },

  possible: {
    backgroundColor: 'rgba(0, 255, 0, 0.5)',
  },
});
