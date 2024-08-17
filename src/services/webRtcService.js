export default function webRtcService(io) {
    io.on('connection',(socket) => {
        console.log('a new webRTC connection',socket.id);

        socket.on('webrtc_offer',(data) =>{
            const {recieverId,offer} = data;
            socket.to(recieverId).emit('webrtc_offer',{senderId:socket.id,offer});
        })

        socket.on('webrtc_answer',(data) =>{
            const {senderId,answer} = data;
            socket.to(senderId).emit('webrtc_answer', {answer});
        })

        socket.on('disconnet',() =>{
            console.log('client has disconneted',socket.id);
        })

    })
}