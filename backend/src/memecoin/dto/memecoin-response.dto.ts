import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../user/dto/user-response.dto';

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

  @ApiProperty({ description: 'The total supply of the memecoin' })
  @Expose()
  totalSupply: number;

  @ApiProperty({ description: 'The current price of the memecoin in ZTH' })
  @Expose()
  currentPrice: number;

  @ApiProperty({ description: 'The market cap of the memecoin in ZTH' })
  @Expose()
  marketCap: number;

  @ApiProperty({ description: 'The 24h trading volume of the memecoin in ZTH' })
  @Expose()
  volume24h: number;

  @ApiProperty({ description: 'The creator of the memecoin' })
  @Expose()
  @Type(() => UserResponseDto)
  creator: UserResponseDto;

  @ApiProperty({ description: 'The ID of the creator' })
  @Expose()
  creatorId: string;

  @ApiProperty({ description: 'Whether the memecoin is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'The date when the memecoin was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the memecoin was last updated' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<MemecoinResponseDto>) {
    Object.assign(this, partial);
  }
} 