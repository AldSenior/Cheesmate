import React, { FC, useState } from 'react'
import { Board } from '../models/Board'
import { Cell } from '../models/Cell'
import { Colors } from '../models/Colors'
import { Player } from '../models/Player'
import CellComponent from './CellComponent'

interface BoardProps {
	board: Board
	currentPlayer: Player | null
	isMyTurn: boolean
	makeMove: (newBoard: Board) => void
	playerColor: Colors
}

const BoardComponent: FC<BoardProps> = ({
	board,
	currentPlayer,
	isMyTurn,
	makeMove,
	playerColor,
}) => {
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
	const [highlightedCells, setHighlightedCells] = useState<Cell[]>([])

	function click(cell: Cell) {
		if (!isMyTurn) return

		if (
			selectedCell &&
			selectedCell !== cell &&
			selectedCell.figure?.canMove(cell)
		) {
			console.log('Фигура перемещена')

			selectedCell.moveFigure(cell)
			setSelectedCell(null)
			setHighlightedCells([])

			const newBoard = board.getCopyBoard()

			// Отправляем новый ход на сервер
			makeMove(newBoard)
		} else {
			console.log('Выбрана фигура')

			if (cell.figure?.color === currentPlayer?.color) {
				setSelectedCell(cell)
				highlightCells(cell)
			}
		}
	}

	function highlightCells(cell: Cell) {
		const highlightedCells = []

		for (let i = 0; i < board.cells.length; i++) {
			const row = board.cells[i]
			for (let j = 0; j < row.length; j++) {
				const target = row[j]
				if (cell.figure?.canMove(target)) {
					highlightedCells.push(target)
				}
			}
		}

		setHighlightedCells(highlightedCells)
	}

	const isBlackPlayer = playerColor === Colors.BLACK
	return (
		<div>
			<h3>Текущий игрок: {currentPlayer?.color}</h3>
			{!isMyTurn && (
				<div className='turn-message'>Ожидайте хода соперника...</div>
			)}
			<div className={`board ${isMyTurn ? '' : 'disabled'}`}>
				{(isBlackPlayer ? board.cells.slice().reverse() : board.cells).map(
					(row, index) => (
						<React.Fragment key={index}>
							{row.map(cell => (
								<CellComponent
									click={click}
									cell={cell}
									key={cell.id}
									selected={
										cell.x === selectedCell?.x && cell.y === selectedCell?.y
									}
									highlighted={highlightedCells.includes(cell)}
									isMyTurn={isMyTurn}
								/>
							))}
						</React.Fragment>
					)
				)}
			</div>
		</div>
	)
}

export default BoardComponent
