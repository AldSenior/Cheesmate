import cors from 'cors'
import express from 'express'
import http from 'http'
import path from 'path' // Импортируем модуль path для работы с путями
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(cors())

// Обслуживание статических файлов из папки dist
// app.use(express.static(path.join(__dirname, '../dist')))

const Colors = {
	WHITE: 'white',
	BLACK: 'black',
}

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
})

interface Room {
	id: string
	players: {
		[key: string]: 'white' | 'black'
	}
	boardState: unknown
	currentPlayer: 'white' | 'black'
}

const rooms = new Map<string, Room>()

app.get('/rooms', (req, res) => {
	const publicRooms = Array.from(rooms.values())
		.filter(room => Object.keys(room.players).length < 2)
		.map(room => ({ id: room.id }))
	res.json(publicRooms)
})

// Все остальные запросы перенаправляются на index.html (для SPA)
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../dist/index.html'))
})

io.on('connection', socket => {
	console.log(`New connection: ${socket.id}`)

	let currentRoomId: string | null = null

	const sendRoomsList = () => {
		const publicRooms = Array.from(rooms.values())
			.filter(room => Object.keys(room.players).length < 2)
			.map(room => ({ id: room.id }))
		io.emit('roomsList', publicRooms)
	}

	socket.on('createRoom', initialBoardState => {
		const roomId = uuidv4()
		const newRoom: Room = {
			id: roomId,
			players: { [socket.id]: 'white' },
			boardState: initialBoardState,
			currentPlayer: 'white',
		}
		rooms.set(roomId, newRoom)
		socket.join(roomId)
		currentRoomId = roomId

		socket.emit('gameStart', {
			roomId,
			boardState: initialBoardState,
			playerColor: 'white',
		})

		sendRoomsList()
	})

	socket.on('joinRoom', (roomId: string) => {
		const room = rooms.get(roomId)
		if (!room || Object.keys(room.players).length >= 2) {
			socket.emit('error', 'Room not found or full')
			return
		}

		room.players[socket.id] = 'black'
		socket.join(roomId)
		currentRoomId = roomId

		socket.emit('gameStart', {
			roomId,
			boardState: room.boardState,
			playerColor: 'black',
		})

		socket.to(roomId).emit('opponentJoined')
		sendRoomsList()
	})

	socket.on('makeMove', (roomId, newBoardState) => {
		const room = rooms.get(roomId)
		if (!room || !room.players[socket.id]) return

		// Обновляем состояние доски
		room.boardState = newBoardState

		// Меняем текущего игрока
		room.currentPlayer =
			room.currentPlayer === Colors.WHITE ? Colors.BLACK : Colors.WHITE

		// Отправляем обновленное состояние доски и текущего игрока всем игрокам в комнате
		io.to(roomId).emit('moveMade', newBoardState, room.currentPlayer)
	})

	socket.on('leaveRoom', roomId => {
		if (roomId) {
			socket.leave(roomId)
			const room = rooms.get(roomId)
			if (room) {
				delete room.players[socket.id]
				if (Object.keys(room.players).length === 0) {
					rooms.delete(roomId)
				} else {
					socket.to(roomId).emit('opponentDisconnected')
				}
			}
			sendRoomsList()
		}
	})

	socket.on('gameOver', (roomId, winner) => {
		io.to(roomId).emit('gameOver', winner) // Уведомляем всех игроков в комнате
	})

	socket.on('disconnect', () => {
		if (currentRoomId) {
			const room = rooms.get(currentRoomId)
			if (room) {
				delete room.players[socket.id]
				if (Object.keys(room.players).length === 0) {
					rooms.delete(currentRoomId)
				} else {
					socket.to(currentRoomId).emit('opponentDisconnected')
				}
			}
			sendRoomsList()
		}
	})
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
