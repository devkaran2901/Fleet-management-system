import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { DispatcherModule } from './dispatcher/dispatcher.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, AdminModule, DispatcherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
