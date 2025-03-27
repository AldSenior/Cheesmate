import { FC, useEffect, useState } from 'react'
import { Board } from '../models/Board'
import { Cell } from '../models/Cell'
import { Colors } from '../models/Colors'
import { Pawn } from '../models/figures/Pawn'
import { Player } from '../models/Player'
import CellComponent from './CellComponent'

interface BoardProps {
	board: Board
	currentPlayer: Player | null
	isMyTurn: boolean
	makeMove: (newBoard: Board) => void
	playerColor: Colors
	gameOverMessage?: string
	onGameOver: (winner: Colors) => void
}

const BoardComponent: FC<BoardProps> = ({
	board,
	currentPlayer,
	isMyTurn,
	makeMove,
	playerColor,
	gameOverMessage,
	onGameOver,
}) => {
	const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
	const [highlightedCells, setHighlightedCells] = useState<Cell[]>([])

	useEffect(() => {
		if (gameOverMessage) {
			setSelectedCell(null)
			setHighlightedCells([])
		}
	}, [gameOverMessage])

	const getColumnLabel = (x: number) => String.fromCharCode(97 + x)
	const getRowLabel = (y: number) => 8 - y

	const isBlackPlayer = playerColor === Colors.BLACK
	const displayCells = isBlackPlayer
		? [...board.cells].reverse().map(row => [...row].reverse())
		: board.cells

	function click(cell: Cell) {
		if (!isMyTurn || gameOverMessage) return

		// Если выбрана клетка с фигурой и кликнули на другую клетку
		if (
			selectedCell &&
			selectedCell !== cell &&
			selectedCell.figure?.canMove(cell)
		) {
			const newBoard = board.getCopyBoard()
			const newSelectedCell = newBoard.getCell(selectedCell.x, selectedCell.y)
			const newTargetCell = newBoard.getCell(cell.x, cell.y)

			// Обработка взятия на проходе перед перемещением фигуры
			if (
				selectedCell.figure instanceof Pawn &&
				cell.isEmpty() &&
				selectedCell.x !== cell.x
			) {
				const direction = selectedCell.figure.color === Colors.BLACK ? 1 : -1
				const capturedCell = newBoard.getCell(cell.x, cell.y - direction)

				// Удаляем пешку, которая берется на проходе
				if (capturedCell.figure) {
					if (capturedCell.figure.color === Colors.BLACK) {
						newBoard.lostBlackFigures.push(capturedCell.figure)
					} else {
						newBoard.lostWhiteFigures.push(capturedCell.figure)
					}
					capturedCell.figure = null
				}
			}

			// Перемещаем фигуру
			newSelectedCell.moveFigure(newTargetCell)

			// Проверка на мат
			if (
				newBoard.isCheckmate(
					playerColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE
				)
			) {
				onGameOver(playerColor)
			}

			// Сбрасываем выделение
			setSelectedCell(null)
			setHighlightedCells([])

			// Отправляем новый ход
			makeMove(newBoard)
		}
		// Если кликнули на свою фигуру
		else if (cell.figure?.color === currentPlayer?.color) {
			setSelectedCell(cell)
			highlightCells(cell)
		}
	}

	function highlightCells(cell: Cell) {
		const highlights = board.cells
			.flat()
			.filter(target => cell.figure?.canMove(target))
		setHighlightedCells(highlights)
	}

	return (
		<div className='flex flex-col items-center gap-4'>
			<h3 className='text-xl font-bold'>
				Текущий игрок: {currentPlayer?.color}
			</h3>

			{gameOverMessage && (
				<div className='text-red-600 font-bold text-lg'>{gameOverMessage}</div>
			)}

			{!isMyTurn && (
				<div className='text-gray-500'>Ожидайте хода соперника...</div>
			)}

			<div className='flex items-start gap-2'>
				{/* Left row labels */}
				<div className='flex flex-col-reverse text-gray-600 font-mono'>
					{displayCells.map((_, i) => (
						<div key={i} className='bukvi'>
							{getRowLabel(i)}
						</div>
					))}
				</div>

				{/* Main board */}
				<div className='flex flex-col '>
					{displayCells.map((row, y) => (
						<div key={y} className='flex'>
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
						</div>
					))}

					{/* Bottom column labels */}
					<div className='flex justify-center text-gray-600 font-mono'>
						{displayCells[0].map((_, i) => (
							<div key={i} className='bukvi'>
								{getColumnLabel(isBlackPlayer ? 7 - i : i)}
							</div>
						))}
					</div>
				</div>

				{/* Right row labels */}
				<div className='flex flex-col-reverse text-gray-600 font-mono'>
					{displayCells.map((_, i) => (
						<div key={i} className='bukvi'>
							{getRowLabel(i)}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default BoardComponent
