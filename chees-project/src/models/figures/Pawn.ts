import blackLogo from '../../assets/black-pawn.png'
import whiteLogo from '../../assets/white-pawn.png'
import { Cell } from '../Cell'
import { Colors } from '../Colors'
import { Figure, FigureNames } from './Figure'

export class Pawn extends Figure {
	isFirstStep: boolean = true // Флаг первого хода пешки

	constructor(color: Colors, cell: Cell) {
		super(color, cell)
		this.logo = color === Colors.BLACK ? blackLogo : whiteLogo
		this.name = FigureNames.PAWN
	}

	canMove(target: Cell): boolean {
		if (!super.canMove(target)) {
			console.log(`[Pawn] Базовые проверки не пройдены`)
			return false
		}

		const direction = this.color === Colors.BLACK ? 1 : -1
		const startRow = this.color === Colors.BLACK ? 1 : 6

		// Правильное движение вперед
		if (target.x === this.cell.x) {
			// Ход на 1 клетку
			if (target.y === this.cell.y + direction && target.isEmpty()) {
				console.log(`[Pawn] Разрешено движение на 1 клетку`)
				return true
			}

			// Ход на 2 клетки только со стартовой позиции
			if (
				this.isFirstStep &&
				this.cell.y === startRow &&
				target.y === this.cell.y + 2 * direction &&
				this.cell.board
					.getCell(this.cell.x, this.cell.y + direction)
					.isEmpty() &&
				target.isEmpty()
			) {
				console.log(`[Pawn] Разрешено движение на 2 клетки`)
				return true
			}
		}

		// Взятие фигур и на проходе
		if (
			Math.abs(target.x - this.cell.x) === 1 &&
			target.y === this.cell.y + direction
		) {
			// Прямое взятие
			if (!target.isEmpty()) {
				console.log(`[Pawn] Обычное взятие`)
				return true
			}
			// Взятие на проходе
			if (this.canEnPassant(target)) {
				console.log(`[Pawn] Взятие на проходе разрешено`)
				return true
			}
		}

		console.log(`[Pawn] Все проверки не пройдены`)
		return false
	}

	// Pawn.ts
	private canEnPassant(target: Cell): boolean {
		console.log('[EnPassant] Начало проверки взятия на проходе')

		if (!this.cell.board.lastMove) {
			console.log('[EnPassant] Нет информации о последнем ходе')
			return false
		}

		const lastMove = this.cell.board.lastMove
		console.log(`[EnPassant] Последний ход: 
			От (${lastMove.from.x},${lastMove.from.y}) 
			До (${lastMove.to.x},${lastMove.to.y})
			Фигура: ${lastMove.to.figure?.constructor.name || 'нет'}`)

		// 1. Проверяем, что последний ход был пешкой
		const isPawn = lastMove.to.figure instanceof Pawn
		console.log(`[EnPassant] Это пешка: ${isPawn}`)

		// 2. Проверяем ход на 2 клетки
		const isTwoSteps = Math.abs(lastMove.to.y - lastMove.from.y) === 2
		console.log(`[EnPassant] Ход на 2 клетки: ${isTwoSteps}`)

		// 3. Проверяем цвет пешки
		const isEnemy = lastMove.to.figure?.color !== this.color
		console.log(`[EnPassant] Чужая пешка: ${isEnemy}`)

		// 4. Проверяем позицию текущей пешки
		const correctRow = this.cell.y === (this.color === Colors.BLACK ? 4 : 3)
		console.log(`[EnPassant] Правильная горизонталь: ${correctRow}`)

		// 5. Проверяем целевую позицию
		const correctTarget = target.x === lastMove.to.x
		console.log(`[EnPassant] Правильная колонка: ${correctTarget}`)

		const result =
			isPawn && isTwoSteps && isEnemy && correctRow && correctTarget
		console.log(`[EnPassant] Результат проверки: ${result}`)

		return result
	}
	moveFigure(target: Cell): void {
		console.log(
			`[Pawn] Перемещение пешки с (${this.cell.x},${this.cell.y}) на (${target.x},${target.y})`
		)
		super.moveFigure(target)

		if (this.isFirstStep) {
			console.log('[Pawn] Первый ход завершен, isFirstStep = false')
			this.isFirstStep = false
		}
	}

	clone(): Pawn {
		const newPawn = new Pawn(this.color, this.cell)
		newPawn.isFirstStep = this.isFirstStep
		console.log(
			`[Pawn] Клонирование пешки. isFirstStep = ${newPawn.isFirstStep}`
		)
		return newPawn
	}
}
