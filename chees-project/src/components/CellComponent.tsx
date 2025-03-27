import React from 'react'
import { Cell } from '../models/Cell'

interface CellProps {
	cell: Cell
	selected: boolean
	highlighted: boolean
	click: (cell: Cell) => void
	isMyTurn: boolean
}

const CellComponent: React.FC<CellProps> = ({
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
