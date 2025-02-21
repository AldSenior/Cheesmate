import { Cell } from "./Cell"
import { Colors } from "./Colors"
import { Bishop } from "./figures/Bishop"
import { Figure } from "./figures/Figure"
import { King } from "./figures/King"
import { Knight } from "./figures/Knight"
import { Pawn } from "./figures/Pawn"
import { Queen } from "./figures/Queen"
import { Rook } from "./figures/Rook"

export class Board {
  cells: Cell[][] = []
  lostBlackFigures: Figure[] = []
  lostWhiteFigures: Figure[] = []

  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = []
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          row.push(new Cell(this, j, i, Colors.BLACK, null)) // Черные ячейки
        } else {
          row.push(new Cell(this, j, i, Colors.WHITE, null)) // белые
        }
      }
      this.cells.push(row)
    }
  }

  // public getCopyBoard(): Board {
  //   const newBoard = new Board()
  //   newBoard.cells = this.cells
  //   newBoard.lostWhiteFigures = this.lostWhiteFigures
  //   newBoard.lostBlackFigures = this.lostBlackFigures
  //   return newBoard
  // }
  public getCopyBoard(): Board {
    const newBoard = new Board()

    // Создаем глубокую копию ячеек доски
    newBoard.cells = this.cells.map(row =>
      row.map(cell => new Cell(newBoard, cell.x, cell.y, cell.color, cell.figure ? cell.figure.clone() : null))
    )

    // Создаем глубокую копию потерянных фигур
    newBoard.lostWhiteFigures = this.lostWhiteFigures.map(figure => figure.clone())
    newBoard.lostBlackFigures = this.lostBlackFigures.map(figure => figure.clone())

    return newBoard
  }

  public highlightCells(selectedCell: Cell | null) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i]
      for (let j = 0; j < row.length; j++) {
        const target = row[j]
        target.available = !!selectedCell?.figure?.canMove(target)
      }
    }
  }

  public getCell(x: number, y: number) {
    return this.cells[y][x]
  }
  // toJSON() {
  //   return {
  //     cells: this.cells,
  //     lostBlackFigures: this.lostBlackFigures,
  //     lostWhiteFigures: this.lostWhiteFigures
  //   }
  // }
  toJSON() {
    return {
      cells: this.cells.map(row => row.map(cell => ({
        x: cell.x,
        y: cell.y,
        color: cell.color,
        figure: cell.figure ? {
          type: cell.figure.constructor.name,
          color: cell.figure.color,
        } : null,
      }))),
      lostBlackFigures: this.lostBlackFigures.map(figure => ({
        type: figure.constructor.name,
        color: figure.color,
      })),
      lostWhiteFigures: this.lostWhiteFigures.map(figure => ({
        type: figure.constructor.name,
        color: figure.color,
      })),
    }
  }
  static fromJSON(json: any): Board {
    const board = new Board()
    board.cells = json.cells.map((row: any) =>
      row.map((cellData: any) => {
        const cell = new Cell(board, cellData.x, cellData.y, cellData.color, null)
        if (cellData.figure) {
          const figureClass = {
            'Pawn': Pawn,
            'Bishop': Bishop,
            'King': King,
            'Knight': Knight,
            'Queen': Queen,
            'Rook': Rook
          }[cellData.figure.type]
          if (figureClass) {
            cell.figure = new figureClass(cellData.figure.color, cell)
          }
        }
        return cell
      })
    )
    board.lostBlackFigures = json.lostBlackFigures.map((figureData: any) => {
      const figureClass = {
        'Pawn': Pawn,
        'Bishop': Bishop,
        'King': King,
        'Knight': Knight,
        'Queen': Queen,
        'Rook': Rook
      }[figureData.type]
      return figureClass ? new figureClass(figureData.color, new Cell(board, 0, 0, Colors.WHITE, null)) : null
    })
    board.lostWhiteFigures = json.lostWhiteFigures.map((figureData: any) => {
      const figureClass = {
        'Pawn': Pawn,
        'Bishop': Bishop,
        'King': King,
        'Knight': Knight,
        'Queen': Queen,
        'Rook': Rook
      }[figureData.type]
      return figureClass ? new figureClass(figureData.color, new Cell(board, 0, 0, Colors.WHITE, null)) : null
    })
    return board
  }

  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1))
      new Pawn(Colors.WHITE, this.getCell(i, 6))
    }
  }

  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0))
    new King(Colors.WHITE, this.getCell(4, 7))
  }

  private addQueens() {
    new Queen(Colors.BLACK, this.getCell(3, 0))
    new Queen(Colors.WHITE, this.getCell(3, 7))
  }

  private addBishops() {
    new Bishop(Colors.BLACK, this.getCell(2, 0))
    new Bishop(Colors.BLACK, this.getCell(5, 0))
    new Bishop(Colors.WHITE, this.getCell(2, 7))
    new Bishop(Colors.WHITE, this.getCell(5, 7))
  }

  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0))
    new Knight(Colors.BLACK, this.getCell(6, 0))
    new Knight(Colors.WHITE, this.getCell(1, 7))
    new Knight(Colors.WHITE, this.getCell(6, 7))
  }

  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0))
    new Rook(Colors.BLACK, this.getCell(7, 0))
    new Rook(Colors.WHITE, this.getCell(0, 7))
    new Rook(Colors.WHITE, this.getCell(7, 7))
  }

  // public addFisherFigures() {
  //
  // }

  public addFigures() {
    this.addPawns()
    this.addKnights()
    this.addKings()
    this.addBishops()
    this.addQueens()
    this.addRooks()
  }
}
