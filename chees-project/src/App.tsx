import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import './App.css'
import BoardComponent from './components/BoardComponent'
import LostFigures from './components/LostFigures'
import Timer from './components/Timer'
import { Board } from './models/Board'
import { Colors } from './models/Colors'
import { Player } from './models/Player'

type GameStartData = {
  roomId: string
  boardState: Board
  playerColor: Colors
}

const socket: Socket = io('http://localhost:8080')

const App = () => {
  const [board, setBoard] = useState(new Board())
  const [whitePlayer] = useState(new Player(Colors.WHITE))
  const [blackPlayer] = useState(new Player(Colors.BLACK))
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(whitePlayer)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [playerColor, setPlayerColor] = useState<Colors | null>(null)
  const [roomsList, setRoomsList] = useState<{ id: string }[]>([])

  useEffect(() => {
    restart()

    socket.on('gameStart', (data: GameStartData) => {
      setCurrentRoom(data.roomId)
      setPlayerColor(data.playerColor)
      setCurrentPlayer(data.playerColor === Colors.WHITE ? whitePlayer : blackPlayer)
      setBoard(Board.fromJSON(data.boardState))
    })

    socket.on('moveMade', (newBoardState: Board, currentPlayerColor: Colors) => {
      setBoard(Board.fromJSON(newBoardState))
      setCurrentPlayer(currentPlayerColor === Colors.WHITE ? whitePlayer : blackPlayer)
    })

    socket.on('roomsList', (rooms: { id: string }[]) => {
      setRoomsList(rooms)
    })

    socket.on('opponentJoined', () => {
      alert('Opponent joined! Game starts!')
    })

    socket.on('opponentDisconnected', () => {
      alert('Opponent disconnected!')
      handleDisconnect()
    })

    return () => {
      socket.off('gameStart')
      socket.off('moveMade')
      socket.off('roomsList')
      socket.off('opponentJoined')
      socket.off('opponentDisconnected')
    }
  }, [])

  function restart() {
    const newBoard = new Board()
    newBoard.initCells()
    newBoard.addFigures()
    setBoard(newBoard)
  }

  function handleCreateRoom() {
    restart()
    socket.emit('createRoom', board.toJSON())
  }

  function handleJoinRoom(roomId: string) {
    socket.emit('joinRoom', roomId)
  }

  function handleDisconnect() {
    socket.emit('leaveRoom', currentRoom)
    setCurrentRoom(null)
    setPlayerColor(null)
    setCurrentPlayer(null)
    restart()
  }

  // function makeMove(newBoard: Board) {
  //   if (currentRoom && playerColor === currentPlayer?.color) {
  //     socket.emit('makeMove', currentRoom, newBoard.toJSON())
  //   }
  // }

  function setBoardAndMakeMove(newBoard: Board) {
    setBoard(newBoard) // Обновляем состояние доски на клиенте
    if (currentRoom && playerColor === currentPlayer?.color) {
      socket.emit('makeMove', currentRoom, newBoard.toJSON()) // Отправляем ход на сервер
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!currentRoom ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Chess Game</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4"
            onClick={handleCreateRoom}
          >
            Create New Room
          </button>
          <div className="mt-4">
            <h3 className="text-2xl">Available Rooms:</h3>
            {roomsList.length > 0 ? (
              <div className="flex flex-col">
                {roomsList.map((room) => (
                  <button
                    key={room.id}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Join Room {room.id}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2">No available rooms. Create one!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <Timer restart={restart} currentPlayer={currentPlayer} />
            <div>Your color: {playerColor}</div>
            <div>Current room: {currentRoom}</div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4"
              onClick={handleDisconnect}
            >
              Leave Room
            </button>
          </div>

          <BoardComponent
            board={board}
            setBoard={setBoard} // Передаем setBoardAndMakeMove
            currentPlayer={currentPlayer}
            isMyTurn={playerColor === currentPlayer?.color}
            makeMove={setBoardAndMakeMove} // Передаем makeMove
          />

          <div className="flex justify-around mt-4">
            <LostFigures title="Black Figures" figures={board.lostBlackFigures} />
            <LostFigures title="White Figures" figures={board.lostWhiteFigures} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App