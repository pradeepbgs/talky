import { redis } from "../redis";

 class redisService {
    constructor(){
        this.redis = redis
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

    async removeQueueMessages(user_id){
        await this.redis.lpop(`messages:${user_id}`)
    }

    async subscribeToChannel(channel) {
        await this.redis.subscribe(channel);
      }

      onMessage(callback) {
        this.redis.on('message', callback);
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
          if (id === socketId) {
            return key.split(':')[1]; 
          }
        }
        return null;
      }
}

export default new redisService()

    

