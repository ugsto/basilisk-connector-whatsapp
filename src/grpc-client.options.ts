import { Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'whatsapp',
    protoPath: join(__dirname, 'grpc/whatsapp.proto'),
    url: '0.0.0.0:50051',
  },
} as const;
