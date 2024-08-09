import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import WebSocketService from './services/webSocketService.js'
import path from 'path'

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = new Server(server,{cors:{origin:'*'}})

app.use(express.json())
app.use(express.static(path.resolve('./src/public')))

/// here we will define our midlle for routes
import router from './routes/user.routes.js'
import connectDB from './config/dbconfig.js'

app.use('/api/user',router)


WebSocketService(io)

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./public/index.html'))
});

connectDB();
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})