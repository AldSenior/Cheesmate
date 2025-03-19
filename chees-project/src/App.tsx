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
	const [gameOverMessage, setGameOverMessage] = useState<string>('')

	useEffect(() => {
		console.log('Initializing game...')
		restart()

		socket.on('gameStart', (data: GameStartData) => {
			console.log('Game started:', data)
			setCurrentRoom(data.roomId)
			setPlayerColor(data.playerColor)
			setBoard(Board.fromJSON(data.boardState))
			setGameOverMessage('')
		})

		socket.on(
			'moveMade',
			(newBoardState: Board, currentPlayerColor: Colors) => {
				console.log('Move made by:', currentPlayerColor)
				const newBoard = Board.fromJSON(newBoardState)
				setBoard(newBoard)
				const nextPlayer =
					currentPlayerColor === Colors.WHITE ? whitePlayer : blackPlayer
				setCurrentPlayer(nextPlayer)

				// Проверка мата для игрока, который только что получил ход
				const enemyColor =
					currentPlayerColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE
				console.log('Checking for checkmate for:', enemyColor)
				const isMate = newBoard.isCheck(enemyColor)
				console.log('Is checkmate:', isMate)

				if (isMate) {
					const winner = currentPlayerColor
					console.log('Game over! Winner:', winner)
					socket.emit('gameOver', currentRoom, winner) // Уведомляем сервер о завершении игры
				}
			}
		)

		socket.on('gameOver', (winner: Colors) => {
			console.log('Game over received, winner:', winner)
			if (winner === playerColor) {
				setGameOverMessage('Вы победили! Мат!')
			} else {
				setGameOverMessage('Вы проиграли! Мат!')
			}
			// Перенаправляем всех игроков в меню через 5 секунд
			setTimeout(() => {
				handleDisconnect()
			}, 5000)
		})

		socket.on('roomsList', (rooms: { id: string }[]) => {
			console.log('Rooms list updated:', rooms)
			setRoomsList(rooms)
		})

		socket.on('opponentJoined', () => {
			console.log('Opponent joined!')
			alert('Соперник присоединился! Игра начинается!')
		})

		socket.on('opponentDisconnected', () => {
			console.log('Opponent disconnected!')
			handleDisconnect()
		})

		return () => {
			console.log('Cleaning up socket listeners...')
			socket.off('gameStart')
			socket.off('moveMade')
			socket.off('gameOver')
			socket.off('roomsList')
			socket.off('opponentJoined')
			socket.off('opponentDisconnected')
		}
	}, [playerColor])

	function restart() {
		console.log('Restarting game...')
		const newBoard = new Board()
		newBoard.initCells()
		newBoard.addFigures()
		setBoard(newBoard)
		setGameOverMessage('')
		setCurrentPlayer(whitePlayer)
	}

	function handleGameOver(winner: Colors) {
		console.log('Game over detected, winner:', winner)
		if (winner === playerColor) {
			setGameOverMessage('Вы победили! Мат!')
		} else {
			setGameOverMessage('Вы проиграли! Мат!')
		}
	}

	function handleCreateRoom() {
		console.log('Creating new room...')
		restart()
		socket.emit('createRoom', board.toJSON())
	}

	function handleJoinRoom(roomId: string) {
		console.log('Joining room:', roomId)
		socket.emit('joinRoom', roomId)
	}

	function handleDisconnect() {
		console.log('Disconnecting from room...')
		socket.emit('leaveRoom', currentRoom)
		setCurrentRoom(null)
		setPlayerColor(null)
		setCurrentPlayer(null)
		restart()
	}

	function setBoardAndMakeMove(newBoard: Board) {
		if (gameOverMessage) {
			console.log('Game over, ignoring move')
			return
		}

		// Проверка мата для противника после нашего хода
		const enemyColor =
			playerColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE
		console.log('Checking for checkmate for:', enemyColor)
		const isMate = newBoard.isCheck(enemyColor)
		console.log('Is checkmate:', isMate)

		setBoard(newBoard)
		if (currentRoom && playerColor === currentPlayer?.color) {
			console.log('Emitting move to server...')
			socket.emit('makeMove', currentRoom, newBoard.toJSON())
		}

		if (isMate) {
			console.log('Checkmate detected!')
			socket.emit('gameOver', currentRoom, playerColor) // Уведомляем сервер о завершении игры
		}
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
			{!currentRoom ? (
				<div className='text-center'>
					<h1 className='text-4xl font-bold mb-4'>Шахматы</h1>
					<button
						className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4'
						onClick={handleCreateRoom}
					>
						Создать комнату
					</button>
					<div className='mt-4'>
						<h3 className='text-2xl'>Доступные комнаты:</h3>
						{roomsList.length > 0 ? (
							<div className='flex flex-col'>
								{roomsList.map(room => (
									<button
										key={room.id}
										className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2'
										onClick={() => handleJoinRoom(room.id)}
									>
										Присоединиться к {room.id}
									</button>
								))}
							</div>
						) : (
							<p className='mt-2'>Нет доступных комнат</p>
						)}
					</div>
				</div>
			) : (
				<div className='text-center'>
					<div className='mb-4'>
						<Timer restart={restart} currentPlayer={currentPlayer} />
						<div className='text-xl mb-2'>Ваш цвет: {playerColor}</div>
						<div className='text-sm text-gray-600'>Комната: {currentRoom}</div>

						{gameOverMessage && (
							<div className='game-over bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4'>
								{gameOverMessage}
								<button
									className='bg-red-500 text-white px-4 py-2 rounded-lg mt-2 ml-2'
									onClick={handleDisconnect}
								>
									Новая игра
								</button>
							</div>
						)}

						<button
							className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 mt-4'
							onClick={handleDisconnect}
						>
							Выйти из игры
						</button>
					</div>

					<BoardComponent
						board={board}
						currentPlayer={currentPlayer}
						isMyTurn={!gameOverMessage && playerColor === currentPlayer?.color}
						makeMove={setBoardAndMakeMove}
						playerColor={playerColor!}
						gameOverMessage={gameOverMessage}
						onGameOver={handleGameOver}
					/>

					<div className='flex justify-around mt-4 gap-4'>
						<LostFigures
							title='Потерянные чёрные'
							figures={board.lostBlackFigures}
						/>
						<LostFigures
							title='Потерянные белые'
							figures={board.lostWhiteFigures}
						/>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
