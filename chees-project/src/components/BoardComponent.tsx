import React, { FC, useEffect, useState } from 'react'
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
	gameOverMessage?: string
	onGameOver: (winner: Colors) => void // Добавлено
}

const BoardComponent: FC<BoardProps> = ({
	board,
	currentPlayer,
	isMyTurn,
	makeMove,
	playerColor,
	gameOverMessage,
	onGameOver, // Добавлено
}) => {
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
	const [highlightedCells, setHighlightedCells] = useState<Cell[]>([])

	useEffect(() => {
		if (gameOverMessage) {
			setSelectedCell(null)
			setHighlightedCells([])
		}
	}, [gameOverMessage])

	function click(cell: Cell) {
		if (!isMyTurn || gameOverMessage) {
			console.log('Not my turn or game over, ignoring click')
			return
		}

		if (
			selectedCell &&
			selectedCell !== cell &&
			selectedCell.figure?.canMove(cell)
		) {
			console.log('Moving figure from', selectedCell, 'to', cell)

			// Создаем копию доски для проверки
			const newBoard = board.getCopyBoard()
			const newSelectedCell = newBoard.getCell(selectedCell.x, selectedCell.y)
			const newTargetCell = newBoard.getCell(cell.x, cell.y)

			newSelectedCell.moveFigure(newTargetCell)

			// Проверяем мат для противника
			const enemyColor =
				playerColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE
			const isMate = newBoard.isCheckmate(enemyColor)

			if (isMate) {
				console.log('Checkmate detected!')
				onGameOver(playerColor) // Уведомляем о победе
			}

			setSelectedCell(null)
			setHighlightedCells([])
			makeMove(newBoard)
		} else {
			if (cell.figure?.color === currentPlayer?.color) {
				console.log('Selected figure:', cell.figure)
				setSelectedCell(cell)
				highlightCells(cell)
			}
		}
	}

	function highlightCells(cell: Cell) {
		console.log('Highlighting cells for:', cell)
		const highlights: Cell[] = []

		for (const row of board.cells) {
			for (const target of row) {
				if (cell.figure?.canMove(target)) {
					console.log('Highlighting cell:', target)
					highlights.push(target)
				}
			}
		}

		setHighlightedCells(highlights)
	}

	const isBlackPlayer = playerColor === Colors.BLACK
	return (
		<div>
			<h3>Текущий игрок: {currentPlayer?.color}</h3>
			{gameOverMessage && (
				<div className='game-over-message'>{gameOverMessage}</div>
			)}
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
