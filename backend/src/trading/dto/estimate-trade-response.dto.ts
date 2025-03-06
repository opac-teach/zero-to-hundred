import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MemecoinResponseDto } from '../../memecoin/dto';

@Exclude()
export class TradeEstimationResponseDto {
  @ApiProperty({ description: 'The memecoin details' })
  @Expose()
  @Type(() => MemecoinResponseDto)
  memecoin: MemecoinResponseDto;

  @ApiProperty({ description: 'The cost of the trade' })
  @Expose()
  cost: string;

  @ApiProperty({ description: 'The amount of memecoin tokens to sell' })
  @Expose()
  amount: string;

  constructor(partial: Partial<TradeEstimationResponseDto>) {
    Object.assign(this, partial);
  }
}
