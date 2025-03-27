import { Colors } from './Colors'
import { Pawn } from './figures/Pawn'

export class Cell {
	readonly x: number
	readonly y: number
	readonly color: Colors
	figure: Figure | null
	board: Board
	available: boolean // Можешь ли переместиться
	id: number // Для реакт ключей

	constructor(
		board: Board,
		x: number,
		y: number,
		color: Colors,
		figure: Figure | null
	) {
		this.x = x
		this.y = y
		this.color = color
		this.figure = figure
		this.board = board
		this.available = false
		this.id = Math.random()
	}

	isEmpty(): boolean {
		return this.figure === null
	}

	isEnemy(target: Cell): boolean {
		if (target.figure) {
			return this.figure?.color !== target.figure.color
		}
		return false
	}

	isEmptyVertical(target: Cell): boolean {
		if (this.x !== target.x) {
			return false
		}

		const min = Math.min(this.y, target.y)
		const max = Math.max(this.y, target.y)
		for (let y = min + 1; y < max; y++) {
			if (!this.board.getCell(this.x, y).isEmpty()) {
				return false
			}
		}
		return true
	}

	isEmptyHorizontal(target: Cell): boolean {
		if (this.y !== target.y) {
			return false
		}

		const min = Math.min(this.x, target.x)
		const max = Math.max(this.x, target.x)
		for (let x = min + 1; x < max; x++) {
			if (!this.board.getCell(x, this.y).isEmpty()) {
				return false
			}
		}
		return true
	}

	isEmptyDiagonal(target: Cell): boolean {
		const absX = Math.abs(target.x - this.x)
		const absY = Math.abs(target.y - this.y)
		if (absY !== absX) return false

		const dy = this.y < target.y ? 1 : -1
		const dx = this.x < target.x ? 1 : -1

		for (let i = 1; i < absY; i++) {
			if (!this.board.getCell(this.x + dx * i, this.y + dy * i).isEmpty())
				return false
		}
		return true
	}

	// В методе clone класса Cell
	clone(board: Board): Cell {
		const newCell = new Cell(
			board,
			this.x,
			this.y,
			this.color,
			this.figure ? this.figure.clone() : null
		)
		newCell.available = this.available
		return newCell
	}

	setFigure(figure: Figure) {
		this.figure = figure
		this.figure.cell = this
	}

	addLostFigure(figure: Figure) {
		figure.color === Colors.BLACK
			? this.board.lostBlackFigures.push(figure)
			: this.board.lostWhiteFigures.push(figure)
	}

	// Cell.ts (исправленное перемещение)
	public moveFigure(target: Cell): void {
		this.board.lastMove = {
			from: this,
			to: target,
		}

		if (this.figure?.canMove(target)) {
			// Логика взятия на проходе
			if (
				this.figure instanceof Pawn &&
				target.isEmpty() &&
				this.x !== target.x
			) {
				const dir = this.figure.color === Colors.BLACK ? 1 : -1
				const capturedCell = this.board.getCell(target.x, target.y - dir)
				if (capturedCell.figure) {
					this.addLostFigure(capturedCell.figure)
					capturedCell.figure = null
					console.log(`[Cell] Взятие на проходе выполнено`)
				}
			}

			// Перемещение фигуры
			target.setFigure(this.figure!)
			this.figure!.moveFigure(target)
			this.figure = null
		}
	}
}
