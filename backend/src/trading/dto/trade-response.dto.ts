import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MemecoinResponseDto } from '../../memecoin/dto';
import {
  TransactionResponseDto,
  WalletHoldingResponseDto,
  WalletResponseDto,
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

  @ApiProperty({ description: 'The wallet details' })
  @Expose()
  @Type(() => WalletResponseDto)
  wallet: WalletResponseDto;

  constructor(partial: Partial<TradeResponseDto>) {
    Object.assign(this, partial);
  }
}
