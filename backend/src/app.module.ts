import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { databaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MemecoinModule } from './memecoin/memecoin.module';
import { WalletModule } from './wallet/wallet.module';
import { TradingModule } from './trading/trading.module';
// import { StatisticsModule } from './statistics/statistics.module';
import { BotModule } from './bot/bot.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    MemecoinModule,
    WalletModule,
    TradingModule,
    BotModule,
    // StatisticsModule,
  ],
})
export class AppModule {}

export function registerGlobals(app) {
  // Enable CORS
  app.enableCors();

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable class serializer interceptor
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get('Reflector'), {
      excludeExtraneousValues: true,
    }),
  );
}
