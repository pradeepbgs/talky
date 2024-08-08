
export default async function WebSocketService(io) {
    io.on('connection', (socket) => {
        console.log('new socket connection..!')

        socket.on('joinRoom', (room,username) =>{
            socket.join(room)
            io.to(room).emit('message',{text:`${username} has joined!!`})
        })

        socket.on('sendMessage', async (messageData, room) => {
            const {messageText,userId} = messageData
            io.to(room).emit('message', {text:messageText,userId})
            // we can save message to our DB
        })

        socket.on('disconnect', () => {
            console.log('user left the room')
        })
    });
}   