import React, { FC, useEffect, useState } from 'react'
import { Board } from '../models/Board'
import { Cell } from '../models/Cell'
import { Player } from '../models/Player'
import CellComponent from './CellComponent'

interface BoardProps {
  board: Board
  setBoard: (board: Board) => void
  currentPlayer: Player | null
  isMyTurn: boolean
  makeMove: (newBoard: Board) => void // Добавляем makeMove в пропсы
}

const BoardComponent: FC<BoardProps> = ({ board, setBoard, currentPlayer, isMyTurn, makeMove }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)

  function click(cell: Cell) {
    if (!isMyTurn) return

    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      console.log('Фигура перемещена')

      // Перемещаем фигуру
      selectedCell.moveFigure(cell)
      setSelectedCell(null)

      // Обновляем доску
      const newBoard = board.getCopyBoard()
      setBoard(newBoard)

      // Отправляем новый ход на сервер
      makeMove(newBoard) // Вызываем makeMove только после успешного перемещения
    } else {
      console.log('Выбрана фигура')

      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell)
      }
    }
  }

  useEffect(() => {
    highlightCells()
  }, [selectedCell])

  function highlightCells() {
    board.highlightCells(selectedCell)
    updateBoard()
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard()
    setBoard(newBoard)
  }

  return (
    <div>
      <h3>Текущий игрок: {currentPlayer?.color}</h3>
      {!isMyTurn && <div className="turn-message">Ожидайте хода соперника...</div>}
      <div className={`board ${isMyTurn ? '' : 'disabled'}`}>
        {board.cells.map((row, index) => (
          <React.Fragment key={index}>
            {row.map((cell) => (
              <CellComponent
                click={click}
                cell={cell}
                key={cell.id}
                selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                isMyTurn={isMyTurn}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default BoardComponent