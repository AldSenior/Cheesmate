import logo from '../../assets/black-king.png'
import { Cell } from '../Cell'
import { Colors } from '../Colors'

export enum FigureNames {
	FIGURE = 'Фигура',
	KING = 'Король',
	KNIGHT = 'Конь',
	PAWN = 'Пешка',
	QUEEN = 'Ферзь',
	ROOK = 'Ладья',
	BISHOP = 'Слон',
}

export class Figure {
	color: Colors
	logo: typeof logo | null
	cell: Cell
	name: FigureNames
	id: number

	constructor(color: Colors, cell: Cell) {
		this.color = color
		this.cell = cell
		this.cell.figure = this
		this.logo = null
		this.name = FigureNames.FIGURE
		this.id = Math.random()
	}

	/**
	 * Клонирует фигуру.
	 * @returns Новая фигура с теми же свойствами.
	 */
	clone(): Figure {
		return new Figure(this.color, this.cell)
	}

	/**
	 * Проверяет, может ли фигура переместиться на целевую клетку.
	 * @param target Целевая клетка.
	 * @returns true, если ход возможен, иначе false.
	 */
	canMove(target: Cell): boolean {
		if (target.figure?.color === this.color) return false
		return true
	}

	/**
	 * Перемещает фигуру на целевую клетку.
	 * @param _target Целевая клетка.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	moveFigure(_target: Cell): void {}
}
