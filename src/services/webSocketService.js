import redisService from "./redisService";


export default function WebSocketService(io) {

  io.on("connection", (socket) => {
    console.log("new socket connection..!", socket.id);

    socket.on("register", async (user_id) => {

      await redisService.setUserSocket(user_id,socket.id);
      await redisService.subscribeToChannel(`channel:${user_id}`);

      redisService.onMessage((channel,message) =>{
        if (channel === `channel:${user_id}`) {
          socket.emit("recieveMessage", JSON.parse(message));
        }
      })

      const offileUserMessages = await redisService.getQueuedMessages(user_id)

      if (offileUserMessages.length > 0) {
        console.log("User has offline messages");
        for (const message of offlineMessages) {
          socket.emit("recieveMessage", JSON.parse(message));
        }
        await redisService.removeQueueMessages(user_id);
      } 
    });

    socket.on("sendMessage", async (messageData) => {
      const { messageText, senderId, receiverId } = messageData;

      const message = { text: messageText, senderId: senderId };

      await redisService.queueMessage(receiverId,message)

      const receiverSocketId = await redisService.getUserSocket(receiverId)
      try {
        if (receiverSocketId) {
          await redisService.publishMessage(`channel:${receiverId}`, message)
          await redisService.removeQueueMessages(receiverId)
        } else {
          console.log("User is not online, storing message for later");
        }
      } catch (error) {
        console.log(error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("disconnect", async () => {
      const user = await redisService.findUserBySocketId(socket.id)
      if (user) {
        await redisService.deleteUserSocket(user);
        console.log(`${user} has disconnected`);
      }
    });
  });
}
