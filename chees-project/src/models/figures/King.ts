import blackLogo from '../../assets/black-king.png'
import whiteLogo from '../../assets/white-king.png'
import { Cell } from '../Cell'
import { Colors } from '../Colors'
import { Figure, FigureNames } from './Figure'
import { Rook } from './Rook'

export class King extends Figure {
	hasMoved: boolean = false

	constructor(color: Colors, cell: Cell) {
		super(color, cell)
		this.logo = color === Colors.BLACK ? blackLogo : whiteLogo
		this.name = FigureNames.KING
	}

	canMove(target: Cell): boolean {
		if (!super.canMove(target)) return false

		const deltaX = Math.abs(target.x - this.cell.x)
		const deltaY = Math.abs(target.y - this.cell.y)

		// Regular king move
		if ((deltaX === 1 && deltaY <= 1) || (deltaY === 1 && deltaX <= 1)) {
			return true
		}

		// Castling
		if (!this.hasMoved && deltaY === 0 && Math.abs(deltaX) === 2) {
			return this.canCastle(target)
		}

		return false
	}

	private canCastle(target: Cell): boolean {
		const direction = target.x > this.cell.x ? 1 : -1
		const rookX = direction === 1 ? 7 : 0
		const rookCell = this.cell.board.getCell(rookX, this.cell.y)

		if (
			!rookCell.figure ||
			!(rookCell.figure instanceof Rook) ||
			rookCell.figure.hasMoved
		) {
			return false
		}

		// Check if path is clear
		const start = Math.min(this.cell.x, rookX) + 1
		const end = Math.max(this.cell.x, rookX)
		for (let x = start; x < end; x++) {
			if (!this.cell.board.getCell(x, this.cell.y).isEmpty()) {
				return false
			}
		}

		// Check if king is in check or passes through attacked squares
		const intermediateCells = [
			this.cell.board.getCell(this.cell.x + direction, this.cell.y),
			this.cell.board.getCell(this.cell.x + 2 * direction, this.cell.y),
		]

		return intermediateCells.every(cell => {
			const copyBoard = this.cell.board.getCopyBoard()
			const copyKing = copyBoard.getCell(this.cell.x, this.cell.y).figure
			const copyTarget = copyBoard.getCell(cell.x, cell.y)

			if (copyKing instanceof King) {
				copyKing.cell.moveFigure(copyTarget)
				return !copyBoard.isCheck(this.color)
			}
			return false
		})
	}

	moveFigure(target: Cell): void {
		super.moveFigure(target)

		// Handle castling
		if (Math.abs(target.x - this.cell.x) === 2) {
			const direction = target.x > this.cell.x ? 1 : -1
			const rookX = direction === 1 ? 7 : 0
			const rookCell = this.cell.board.getCell(rookX, this.cell.y)
			const newRookX = this.cell.x + direction

			if (rookCell.figure instanceof Rook) {
				rookCell.figure.moveFigure(
					this.cell.board.getCell(newRookX, this.cell.y)
				)
			}
		}

		this.hasMoved = true
	}

	clone(): King {
		const newKing = new King(this.color, this.cell)
		newKing.hasMoved = this.hasMoved
		return newKing
	}
}
