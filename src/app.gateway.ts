import { WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as redis from 'redis';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit {
  afterInit(server: Server): void {
    const client = redis.createClient(process.env.REDIS_PORT);
    client.subscribe('events');
    client.on('message', (channel, message) => {
      server.emit('message', this.formatResponse(JSON.parse(message)));
    });
    client.on('error', (error) => {
      server.emit('error', error);
    });
  }
  formatResponse(message): any {
    let value;
    const { type, receivedAt, messageId } = message;
    switch (type) {
      case 'identify':
        value = message.traits.email;
        break;
      case 'track':
        value = message.event;
        break;
      case 'page':
        value = message.properties.path;
        break;
      default:
        value = '--';
    }
    return {
      messageId,
      type,
      value,
      receivedAt,
    };
  }
}
