import blackLogo from '../../assets/black-king.png'
import whiteLogo from '../../assets/white-king.png'
import { Cell } from '../Cell'
import { Colors } from '../Colors'
import { Figure, FigureNames } from './Figure'

export class King extends Figure {
	constructor(color: Colors, cell: Cell) {
		super(color, cell)
		this.logo = color === Colors.BLACK ? blackLogo : whiteLogo
		this.name = FigureNames.KING
	}
	canMove(target: Cell): boolean {
		if (!super.canMove(target)) {
			return false
		}

		const deltaX = Math.abs(target.x - this.cell.x)
		const deltaY = Math.abs(target.y - this.cell.y)

		if ((deltaX === 1 && deltaY <= 1) || (deltaY === 1 && deltaX <= 1)) {
			return true
		}

		return false
	}
	clone(): King {
		return new King(this.color, this.cell)
	}
}
