import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { WalletHoldingResponseDto } from './wallet-holding-response.dto';

@Exclude()
export class WalletResponseDto {
  @ApiProperty({ description: 'The unique identifier of the wallet' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The address of the wallet' })
  @Expose()
  address: string;

  @ApiProperty({ description: 'The balance of the wallet in ZTH' })
  @Expose()
  balance: number;

  @ApiProperty({ description: 'The ID of the owner' })
  @Expose()
  ownerId: string;

  @ApiProperty({ description: 'The holdings of the wallet', type: [WalletHoldingResponseDto] })
  @Expose()
  @Type(() => WalletHoldingResponseDto)
  holdings: WalletHoldingResponseDto[];

  @ApiProperty({ description: 'The date when the wallet was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the wallet was last updated' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<WalletResponseDto>) {
    Object.assign(this, partial);
  }
} 