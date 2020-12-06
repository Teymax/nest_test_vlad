import { WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as redis from 'redis';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit {
  afterInit(server: Server): void {
    const client = redis.createClient(process.env.REDIS_PORT);
    client.subscribe('events');
    client.on('message', (channel, message) => {
      console.log(message);
    });
    client.on('error', (error) => {
      server.emit('error', error);
    });
  }
}
