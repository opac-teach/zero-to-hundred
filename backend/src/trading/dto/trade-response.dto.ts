import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TransactionType } from '../../entities/transaction.entity';

@Exclude()
export class TradeResponseDto {
  @ApiProperty({ description: 'The ID of the transaction' })
  @Expose()
  transactionId: string;

  @ApiProperty({
    description: 'The type of transaction',
    enum: TransactionType,
  })
  @Expose()
  type: TransactionType;

  @ApiProperty({ description: 'The ID of the memecoin' })
  @Expose()
  memecoinId: string;

  @ApiProperty({ description: 'The symbol of the memecoin' })
  @Expose()
  memecoinSymbol: string;

  @ApiProperty({
    description: 'The new amount of memecoin tokens held after the transaction',
  })
  @Expose()
  newHoldingAmount: string;

  constructor(partial: Partial<TradeResponseDto>) {
    Object.assign(this, partial);
  }
}
