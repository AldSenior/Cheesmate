import { FC } from 'react'
import { Cell } from '../models/Cell'

interface CellProps {
	cell: Cell
	selected: boolean
	highlighted: boolean // Новый пропс для подсветки
	click: (cell: Cell) => void
	isMyTurn: boolean // Новый пропс
}

const CellComponent: FC<CellProps> = ({
	cell,
	selected,
	highlighted,
	click,
	isMyTurn,
}) => {
	return (
		<div
			className={`cell ${cell.color} ${selected ? 'selected' : ''} ${
				highlighted ? 'available' : ''
			} ${!isMyTurn ? 'disabled' : ''}`}
			onClick={() => isMyTurn && click(cell)}
		>
			{cell.available && !cell.figure && <div className='available' />}
			{cell.figure?.logo && (
				<img src={cell.figure.logo} alt={cell.figure.name} />
			)}
		</div>
	)
}

export default CellComponent
