import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MemecoinResponseDto } from '../../memecoin/dto';

@Exclude()
export class WalletHoldingResponseDto {
  @ApiProperty({ description: 'The unique identifier of the wallet holding' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The ID of the wallet' })
  @Expose()
  walletId: string;

  @ApiProperty({ description: 'The memecoin that is held' })
  @Expose()
  @Type(() => MemecoinResponseDto)
  memecoin: MemecoinResponseDto;

  @ApiProperty({ description: 'The ID of the memecoin' })
  @Expose()
  memecoinId: string;

  @ApiProperty({ description: 'The amount of the memecoin held' })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'The value of the holding in ZTH' })
  @Expose()
  valueUsd: number;

  @ApiProperty({ description: 'The date when the holding was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the holding was last updated' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<WalletHoldingResponseDto>) {
    Object.assign(this, partial);
  }
} 