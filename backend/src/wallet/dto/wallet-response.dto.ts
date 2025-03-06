import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { WalletHoldingResponseDto } from './wallet-holding-response.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class WalletResponseDto {
  @ApiProperty({ description: 'The unique identifier of the wallet' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The ZTH balance of the wallet' })
  @Expose()
  zthBalance: string;

  @ApiProperty({ description: 'The ID of the owner' })
  @Expose()
  ownerId: string;

  @ApiProperty({ description: 'The owner of the wallet' })
  @Expose()
  @Type(() => UserResponseDto)
  owner: UserResponseDto;

  @ApiProperty({
    description: 'The holdings of the wallet',
    type: [WalletHoldingResponseDto],
  })
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
