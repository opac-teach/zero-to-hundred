import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { BondingCurveConfig } from 'src/trading/bonding-curve';

@Exclude()
export class MemecoinResponseDto {
  @ApiProperty({ description: 'The unique identifier of the memecoin' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The name of the memecoin' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'The symbol of the memecoin' })
  @Expose()
  symbol: string;

  @ApiProperty({ description: 'The description of the memecoin' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'The logo URL of the memecoin' })
  @Expose()
  logoUrl: string;

  @ApiProperty({ description: 'The creator of the memecoin' })
  @Expose()
  @Type(() => UserResponseDto)
  creator: UserResponseDto;

  @ApiProperty({ description: 'The ID of the creator' })
  @Expose()
  creatorId: string;

  @ApiProperty({ description: 'The total supply of the memecoin' })
  @Expose()
  totalSupply: string;

  @ApiProperty({ description: 'The current price of the memecoin' })
  @Expose()
  currentPrice: string;

  @ApiProperty({ description: 'The 24h trading volume of the memecoin' })
  @Expose()
  volume24h: string;

  @ApiProperty({ description: 'The date when the memecoin was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the memecoin was last updated' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'The bonding curve configuration' })
  @Expose()
  curveConfig: BondingCurveConfig;

  constructor(partial: Partial<MemecoinResponseDto>) {
    Object.assign(this, partial);
  }
}
