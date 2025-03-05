import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { TransactionType } from '../../entities/transaction.entity';
import { MemecoinResponseDto } from '../../memecoin/dto';

@Exclude()
export class TradeResponseDto {
  @ApiProperty({ description: 'The unique identifier of the transaction' })
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

  @ApiProperty({ description: 'The new holding amount after the trade' })
  @Expose()
  @Transform(({ value }) => parseFloat(value))
  newHoldingAmount: number;

  @ApiProperty({ description: 'The memecoin involved in the trade' })
  @Expose()
  @Type(() => MemecoinResponseDto)
  memecoin: MemecoinResponseDto;

  constructor(partial: Partial<TradeResponseDto>) {
    Object.assign(this, partial);
  }
}
