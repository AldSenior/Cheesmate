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
}

export interface BoardData {
	cells: CellData[][]
	lostBlackFigures: FigureData[]
	lostWhiteFigures: FigureData[]
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

	public getCopyBoard(): Board {
		const newBoard = new Board()

		newBoard.cells = this.cells.map(row =>
			row.map(
				cell =>
					new Cell(
						newBoard,
						cell.x,
						cell.y,
						cell.color,
						cell.figure ? cell.figure.clone() : null
					)
			)
		)

		newBoard.lostWhiteFigures = this.lostWhiteFigures.map(figure =>
			figure.clone()
		)
		newBoard.lostBlackFigures = this.lostBlackFigures.map(figure =>
			figure.clone()
		)

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
	toJSON(): BoardData {
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
					const figureClass = {
						Pawn: Pawn,
						Bishop: Bishop,
						King: King,
						Knight: Knight,
						Queen: Queen,
						Rook: Rook,
					}[cellData.figure.type]
					if (figureClass) {
						cell.figure = new figureClass(cellData.figure.color, cell)
					}
				}
				return cell
			})
		)
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
			.filter((figure): figure is Figure => figure !== null) // Убираем null из массива
		board.lostWhiteFigures = json.lostBlackFigures
			.map(figureData => {
				const FigureClass = figureClasses[figureData.type]
				return FigureClass
					? new FigureClass(
							figureData.color,
							new Cell(board, 0, 0, Colors.WHITE, null)
					  )
					: null
			})
			.filter((figure): figure is Figure => figure !== null) // Убираем null из массива
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

	public isCheck(color: Colors): boolean {
		console.log(`[isCheck] Checking if ${color} king is in check`)

		// 1. Находим клетку с королем
		const kingCell = this.findKingCell(color)
		if (!kingCell) {
			console.log(`[isCheck] ${color} king not found!`)
			return false
		}

		console.log(
			`[isCheck] ${color} king found at (${kingCell.x},${kingCell.y})`
		)

		// 2. Определяем цвет противника
		const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE

		// 3. Проверяем все фигуры противника
		for (const row of this.cells) {
			for (const cell of row) {
				const figure = cell.figure

				// Если фигура принадлежит противнику и может атаковать короля
				if (figure && figure.color === enemyColor && figure.canMove(kingCell)) {
					console.log(
						`[isCheck] ${figure.constructor.name} at (${cell.x},${cell.y}) can attack the king!`
					)
					return true
				}
			}
		}

		// 4. Если ни одна фигура не атакует короля, шах отсутствует
		console.log(`[isCheck] ${color} king is not in check`)
		return false
	}

	public isCheckmate(color: Colors): boolean {
		// 1. Проверяем, находится ли король под шахом
		if (!this.isCheck(color)) {
			console.log(`[isCheckmate] ${color} king is not in check. No checkmate.`)
			return false
		}

		// 2. Проверяем все фигуры текущего игрока
		for (const row of this.cells) {
			for (const cell of row) {
				if (cell.figure?.color === color) {
					console.log(
						`[isCheckmate] Checking ${cell.figure.constructor.name} at (${cell.x},${cell.y})`
					)

					// 3. Получаем все допустимые ходы для фигуры
					const validMoves = this.getValidMovesForCell(cell)
					if (validMoves.length > 0) {
						console.log(
							`[isCheckmate] Found ${validMoves.length} valid moves for ${cell.figure.constructor.name} at (${cell.x},${cell.y})`
						)
						console.log(
							`[isCheckmate] Valid moves:`,
							validMoves.map(m => `(${m.x},${m.y})`)
						)
						return false // Если есть хотя бы один допустимый ход, мата нет
					}
				}
			}
		}

		// 4. Если ни одна фигура не может сделать ход, это мат
		console.log(`[isCheckmate] No valid moves found for ${color}. Checkmate!`)
		alert('чек')
		return true
	}
	private getValidMovesForCell(cell: Cell): Cell[] {
		const validMoves: Cell[] = []
		const figure = cell.figure
		if (!figure) {
			console.log('No figure on cell, no valid moves')
			return validMoves
		}

		console.log(
			`Checking valid moves for ${figure.constructor.name} at (${cell.x},${cell.y})`
		)

		for (const row of this.cells) {
			for (const target of row) {
				if (figure.canMove(target)) {
					// Создаем копию доски для проверки
					const boardCopy = this.getCopyBoard()
					const cellCopy = boardCopy.getCell(cell.x, cell.y)
					const targetCopy = boardCopy.getCell(target.x, target.y)

					cellCopy.moveFigure(targetCopy)
					if (!boardCopy.isCheck(figure.color)) {
						console.log(`Valid move to (${target.x},${target.y})`)
						validMoves.push(target)
					}
				}
			}
		}
		console.log(`Total valid moves: ${validMoves.length}`)
		return validMoves
	}

	private findKingCell(color: Colors): Cell | null {
		console.log(`[findKingCell] Searching for ${color} king`)

		for (const row of this.cells) {
			for (const cell of row) {
				if (cell.figure instanceof King && cell.figure.color === color) {
					console.log(
						`[findKingCell] ${color} king found at (${cell.x},${cell.y})`
					)
					return cell
				}
			}
		}

		console.log(`[findKingCell] ${color} king not found!`)
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
}
