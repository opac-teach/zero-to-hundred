import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MemecoinModule } from './memecoin/memecoin.module';
import { WalletService } from './wallet/wallet.service';
import { WalletController } from './wallet/wallet.controller';
import { TradingModule } from './trading/trading.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    MemecoinModule,
    TradingModule,
    StatisticsModule,
  ],
  controllers: [AppController, WalletController],
  providers: [AppService, WalletService],
})
export class AppModule {}
