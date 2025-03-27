import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { TransactionResponseDto } from '../../wallet/dto';
import { WalletResponseDto } from '../../wallet/dto';
import { MemecoinResponseDto } from '../../memecoin/dto';
@Exclude()
export class PublicUserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'The full name of the user' })
  @Expose()
  userTitle: string;

  @ApiProperty({ description: 'The profile picture URL of the user' })
  @Expose()
  profilePictureUrl: string;

  @ApiProperty({ description: 'The banner URL of the user' })
  @Expose()
  bannerUrl: string;

  @ApiProperty({ description: 'The description of the user' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'The background color of the user profile' })
  @Expose()
  backgroundColor: string;

  @ApiProperty({ description: 'The text color of the user profile' })
  @Expose()
  textColor: string;

  @ApiProperty({ description: 'Whether the user is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'The date when the user was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PublicUserResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class PrivateUserResponseDto extends PublicUserResponseDto {
  @ApiProperty({ description: 'The email of the user' })
  @Expose()
  email: string;

  constructor(partial: Partial<PrivateUserResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

@Exclude()
export class UserProfileResponseDto extends PublicUserResponseDto {
  @ApiProperty({
    description: 'The transactions of the user',
    type: [TransactionResponseDto],
  })
  @Expose()
  @Type(() => TransactionResponseDto)
  transactions: TransactionResponseDto[];

  @ApiProperty({
    description: 'The wallet of the user',
    type: WalletResponseDto,
  })
  @Expose()
  @Type(() => WalletResponseDto)
  wallet: WalletResponseDto;

  @ApiProperty({
    description: 'The memecoins created by the user',
    type: [MemecoinResponseDto],
  })
  @Expose()
  @Type(() => MemecoinResponseDto)
  createdMemecoins: MemecoinResponseDto[];

  @ApiProperty({ description: 'The rank of the user' })
  @Expose()
  rank: number;
}
