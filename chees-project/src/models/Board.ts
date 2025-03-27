import { Cell } from './Cell'
import { Colors } from './Colors'
import { Bishop } from './figures/Bishop'
import { Figure } from './figures/Figure'
import { King } from './figures/King'
import { Knight } from './figures/Knight'
import { Pawn } from './figures/Pawn'
import { Queen } from './figures/Queen'
import { Rook } from './figures/Rook'

interface CellData {
	x: number
	y: number
	color: Colors
	figure: FigureData | null
}

interface FigureData {
	type: string
	color: Colors
	isFirstStep?: boolean
}

export interface BoardData {
	cells: CellData[][]
	lostBlackFigures: FigureData[]
	lostWhiteFigures: FigureData[]
	lastMove?: {
		from: { x: number; y: number }
		to: { x: number; y: number }
	}
}

type FigureConstructor = new (color: Colors, cell: Cell) => Figure

const figureClasses: Record<string, FigureConstructor> = {
	Pawn: Pawn,
	Bishop: Bishop,
	King: King,
	Knight: Knight,
	Queen: Queen,
	Rook: Rook,
}

export class Board {
	cells: Cell[][] = []
	lostBlackFigures: Figure[] = []
	lostWhiteFigures: Figure[] = []
	lastMove: { from: Cell; to: Cell } | null = null

	public initCells() {
		for (let i = 0; i < 8; i++) {
			const row: Cell[] = []
			for (let j = 0; j < 8; j++) {
				if ((i + j) % 2 !== 0) {
					row.push(new Cell(this, j, i, Colors.BLACK, null))
				} else {
					row.push(new Cell(this, j, i, Colors.WHITE, null))
				}
			}
			this.cells.push(row)
		}
	}

	public getCopyBoard(): Board {
		const newBoard = new Board()
		newBoard.cells = this.cells.map(row =>
			row.map(cell => {
				const newCell = cell.clone(newBoard)
				if (newCell.figure instanceof Pawn) {
					const originalPawn = cell.figure as Pawn
					newCell.figure.isFirstStep = originalPawn.isFirstStep
				}
				return newCell
			})
		)
		newBoard.lostBlackFigures = [...this.lostBlackFigures]
		newBoard.lostWhiteFigures = [...this.lostWhiteFigures]
		newBoard.lastMove = this.lastMove
			? {
					from: newBoard.getCell(this.lastMove.from.x, this.lastMove.from.y),
					to: newBoard.getCell(this.lastMove.to.x, this.lastMove.to.y),
			  }
			: null
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

	public toJSON(): BoardData {
		return {
			cells: this.cells.map(row =>
				row.map(cell => ({
					x: cell.x,
					y: cell.y,
					color: cell.color,
					figure: cell.figure
						? {
								type: cell.figure.constructor.name,
								color: cell.figure.color,
								isFirstStep:
									cell.figure instanceof Pawn
										? (cell.figure as Pawn).isFirstStep
										: undefined,
						  }
						: null,
				}))
			),
			lostBlackFigures: this.lostBlackFigures.map(figure => ({
				type: figure.constructor.name,
				color: figure.color,
			})),
			lostWhiteFigures: this.lostWhiteFigures.map(figure => ({
				type: figure.constructor.name,
				color: figure.color,
			})),
			lastMove: this.lastMove
				? {
						from: { x: this.lastMove.from.x, y: this.lastMove.from.y },
						to: { x: this.lastMove.to.x, y: this.lastMove.to.y },
				  }
				: undefined,
		}
	}

	static fromJSON(json: BoardData): Board {
		const board = new Board()
		board.cells = json.cells.map(row =>
			row.map(cellData => {
				const cell = new Cell(
					board,
					cellData.x,
					cellData.y,
					cellData.color,
					null
				)
				if (cellData.figure) {
					const figureClass = figureClasses[cellData.figure.type]
					if (figureClass) {
						const figure = new figureClass(cellData.figure.color, cell)
						if (
							figure instanceof Pawn &&
							cellData.figure.isFirstStep !== undefined
						) {
							figure.isFirstStep = cellData.figure.isFirstStep
						}
						cell.figure = figure
					}
				}
				return cell
			})
		)

		if (json.lastMove) {
			board.lastMove = {
				from: board.getCell(json.lastMove.from.x, json.lastMove.from.y),
				to: board.getCell(json.lastMove.to.x, json.lastMove.to.y),
			}
		}

		board.lostBlackFigures = json.lostBlackFigures
			.map(figureData => {
				const FigureClass = figureClasses[figureData.type]
				return FigureClass
					? new FigureClass(
							figureData.color,
							new Cell(board, 0, 0, Colors.WHITE, null)
					  )
					: null
			})
			.filter((figure): figure is Figure => figure !== null)

		board.lostWhiteFigures = json.lostWhiteFigures
			.map(figureData => {
				const FigureClass = figureClasses[figureData.type]
				return FigureClass
					? new FigureClass(
							figureData.color,
							new Cell(board, 0, 0, Colors.WHITE, null)
					  )
					: null
			})
			.filter((figure): figure is Figure => figure !== null)

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

	private findKingCell(color: Colors): Cell | null {
		for (const row of this.cells) {
			for (const cell of row) {
				if (cell.figure instanceof King && cell.figure.color === color) {
					return cell
				}
			}
		}
		return null
	}

	public addFigures() {
		this.addPawns()
		this.addKnights()
		this.addKings()
		this.addBishops()
		this.addQueens()
		this.addRooks()
	}

	public isCheck(color: Colors): boolean {
		const kingCell = this.findKingCell(color)
		if (!kingCell) return false

		for (const row of this.cells) {
			for (const cell of row) {
				const figure = cell.figure
				if (figure && figure.color !== color && figure.canMove(kingCell)) {
					return true
				}
			}
		}
		return false
	}

	public isCheckmate(color: Colors): boolean {
		if (!this.isCheck(color)) return false

		for (const row of this.cells) {
			for (const cell of row) {
				if (cell.figure?.color === color) {
					const moves = this.getValidMovesForCell(cell)
					if (moves.length > 0) return false
				}
			}
		}
		return true
	}

	private getValidMovesForCell(cell: Cell): Cell[] {
		const validMoves: Cell[] = []
		const figure = cell.figure
		if (!figure) return validMoves

		for (const target of this.getAllCells()) {
			if (figure.canMove(target)) {
				const copyBoard = this.getCopyBoard()
				const copyCell = copyBoard.getCell(cell.x, cell.y)
				const copyTarget = copyBoard.getCell(target.x, target.y)

				copyCell.moveFigure(copyTarget)

				if (!copyBoard.isCheck(figure.color)) {
					validMoves.push(target)
				}
			}
		}
		return validMoves
	}

	private getAllCells(): Cell[] {
		return this.cells.flat()
	}
}
