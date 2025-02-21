import { FC } from 'react'
import { Cell } from '../models/Cell'

interface CellProps {
  cell: Cell
  selected: boolean
  click: (cell: Cell) => void
  isMyTurn: boolean // Новый пропс
}

const CellComponent: FC<CellProps> = ({ cell, selected, click, isMyTurn }) => {
  return (
    <div
      className={`cell ${cell.color} ${selected ? 'selected' : ''} ${cell.available && cell.figure ? 'capture' : ''
        } ${!isMyTurn ? 'disabled' : ''}`} // Добавляем класс disabled, если не мой ход
      onClick={() => isMyTurn && click(cell)} // Обрабатываем клик только если мой ход
    >
      {cell.available && !cell.figure && <div className="available" />}
      {cell.figure?.logo && <img src={cell.figure.logo} alt={cell.figure.name} />}
    </div>
  )
}

export default CellComponent