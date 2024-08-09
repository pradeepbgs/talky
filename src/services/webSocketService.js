import redisService from "./redisService.js";


export default function WebSocketService(io) {

  io.on("connection", (socket) => {
    console.log("new socket connection..!", socket.id);

    socket.on("register", async (user_id) => {

      await redisService.setUserSocket(user_id,socket.id);
      await redisService.subscribeToChannel(`channel:${user_id}`);
      console.log('a new user register',user_id)
      redisService.onMessage((channel,message) =>{
        if (channel === `channel:${user_id}`) {
          socket.emit("recieveMessage", JSON.parse(message));
        }
      })

      const offlineUserMessages = await redisService.getQueuedMessages(user_id)

      if (offlineUserMessages.length > 0) {
        console.log("User has offline messages");
        for (const message of offlineUserMessages) {
          socket.emit("recieveMessage", JSON.parse(message));
        }
        await redisService.removeAllQueueMessagesOfUser(user_id);
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
          await redisService.removeAllQueueMessagesOfUser(receiverId)
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
        await redisService.unsubscribeChannel(`channel:${user_id}`);
        console.log(`${user} has disconnected`);
      }
    });
  });
}
