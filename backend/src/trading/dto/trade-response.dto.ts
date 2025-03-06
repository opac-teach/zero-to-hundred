import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { TransactionType } from '../../entities/transaction.entity';
import { MemecoinResponseDto } from '../../memecoin/dto';
import {
  TransactionResponseDto,
  WalletHoldingResponseDto,
} from '../../wallet/dto';

@Exclude()
export class TradeResponseDto {
  @ApiProperty({ description: 'The transaction details' })
  @Expose()
  @Type(() => TransactionResponseDto)
  transaction: TransactionResponseDto;

  @ApiProperty({ description: 'The memecoin details' })
  @Expose()
  @Type(() => MemecoinResponseDto)
  memecoin: MemecoinResponseDto;

  @ApiProperty({ description: 'The wallet holding memecoin' })
  @Expose()
  @Type(() => WalletHoldingResponseDto)
  walletHolding: WalletHoldingResponseDto;

  constructor(partial: Partial<TradeResponseDto>) {
    Object.assign(this, partial);
  }
}
