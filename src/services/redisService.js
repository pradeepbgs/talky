import { redis ,redisSubscriber} from "../redis.js";


 class redisService {
    constructor(){
        this.redis = redis
        this.redisSubscriber = redisSubscriber
    }

    async setUserSocket(user_id,socket_id){
        await this.redis.set(`user:${user_id}`,JSON.stringify(socket_id))
    }

    async getUserSocket(userId) {
        return await this.redis.get(`user:${userId}`);
    }
      
    async queueMessage(receiverId, message) {
        await this.redis.rpush(`messages:${receiverId}`, JSON.stringify(message));
    }

    async getQueuedMessages(userId) {
        return await this.redis.lrange(`messages:${userId}`, 0, -1);
    }

    
    async removeAllQueueMessagesOfUser(user_id) {
      await this.redis.del(`messages:${user_id}`);
    }

    async subscribeToChannel(channel) {
        await this.redisSubscriber.subscribe(channel);
      }

      async unsubscribeChannel(channel){
        await this.redisSubscriber.unsubscribe(channel)
      }

      onMessage(callback) {
        this.redisSubscriber.on('message', callback);
      }

      async publishMessage(channel, message) {
        await this.redis.publish(channel, JSON.stringify(message));
      }
    
      async deleteUserSocket(userId) {
        await this.redis.del(`user:${userId}`);
      }

      async findUserBySocketId(socket_id){
        const keys = await this.redis.keys('user:*');
        for (const key of keys) {
          const id = await this.redis.get(key);
          if (id === socket_id) {
            return key.split(':')[1]; 
          }
        }
        return null;
      }
}

export default new redisService()

    

