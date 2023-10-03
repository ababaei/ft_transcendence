import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
<<<<<<< HEAD

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
=======
import { PrismaController } from './prisma.controller';

@Global()
@Module({
  providers: [PrismaService, PrismaModule],
  exports: [PrismaModule, PrismaService],
  controllers: [PrismaController],
})
export class PrismaModule {}
>>>>>>> origin/newchat_branch_adam
