import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PublicUserResponseDto } from './user-response.dto';
import { WalletResponseDto } from '../../wallet/dto';

class UserResponseWithWalletDto extends PublicUserResponseDto {
  @ApiProperty({ description: 'The wallet of the user' })
  @Expose()
  @Type(() => WalletResponseDto)
  wallet: WalletResponseDto;
}

export class LeaderboardItemDto {
  @ApiProperty({ description: 'The user' })
  @Expose()
  @Type(() => UserResponseWithWalletDto)
  user: UserResponseWithWalletDto;

  @ApiProperty({ description: 'The rank of the user in the leaderboard' })
  @Expose()
  rank: number;

  constructor(user: Partial<PublicUserResponseDto>, rank: number) {
    Object.assign(this, { user, rank });
  }
}

export class LeaderboardDto {
  @ApiProperty({
    description: 'The leaderboard items',
    type: [LeaderboardItemDto],
  })
  @Expose()
  @Type(() => LeaderboardItemDto)
  leaderboard: LeaderboardItemDto[];

  @ApiProperty({ description: 'The total number of users in the leaderboard' })
  @Expose()
  total: number;
}
