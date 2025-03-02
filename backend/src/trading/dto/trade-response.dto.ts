import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TransactionType } from '../../entities/transaction.entity';

@Exclude()
export class TradeResponseDto {
  @ApiProperty({ description: 'The unique identifier of the transaction' })
  @Expose()
  transactionId: string;

  @ApiProperty({ description: 'The type of transaction', enum: TransactionType })
  @Expose()
  type: TransactionType;

  @ApiProperty({ description: 'The ID of the memecoin' })
  @Expose()
  memecoinId: string;

  @ApiProperty({ description: 'The symbol of the memecoin' })
  @Expose()
  memecoinSymbol: string;

  @ApiProperty({ description: 'The amount of the memecoin traded' })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'The price of the memecoin at the time of the trade' })
  @Expose()
  price: number;

  @ApiProperty({ description: 'The total value of the trade in ZTH' })
  @Expose()
  totalValue: number;

  @ApiProperty({ description: 'The new balance of the user in ZTH' })
  @Expose()
  newBalance: number;

  @ApiProperty({ description: 'The new amount of the memecoin held by the user' })
  @Expose()
  newHoldingAmount: number;

  @ApiProperty({ description: 'The date when the trade was executed' })
  @Expose()
  executedAt: Date;

  constructor(partial: Partial<TradeResponseDto>) {
    Object.assign(this, partial);
  }
} 