import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import WebSocketService from './services/webSocketService'



const app = express()
const server = http.createServer(app)
const io = new Server(server,{cors:{origin:'*'}})

app.use(express.json())
app.use('/api/chats')
app.use('/api/message')

WebSocketService(io)