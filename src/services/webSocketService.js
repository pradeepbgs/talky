const messages = {};

export default function WebSocketService(io) {
  let users = {};

  io.on("connection", (socket) => {
    console.log(socket.id);
    console.log("new socket connection..!", socket.id);
    socket.on("register", (user_id) => {
      users[user_id] = socket.id;
      
      if (messages[user_id]) {
        messages[user_id].forEach(message => {
            socket.emit("recieveMessage", message);
        });
        delete messages[user_id];
      } {
        
      }
    });

    socket.on("sendMessage", (messageData) => {
      const { messageText, senderId, receiverId } = messageData;

      const message = { text: messageText, senderId: senderId };

      const receiverSocketId = users[receiverId];
      try {
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("recieveMessage", message);
        } else {
          console.log("User is not online");
          if (!messages[receiverId]) {
            messages[receiverId] = []; // Initialize an array if not already present
          }

          messages[receiverId].push(message);
        }
      } catch (error) {
        console.log(error);
        // or we can emit an error event to the client to handle the error
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      const userId = Object.keys(users).find((key) => users[key] === socket.id);
      if (userId) {
        delete users[userId];
        console.log(`${userId} has disconnected`);
      }
    });
  });
}
