import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class LeaderboardItem {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @Expose()
  user: UserResponseDto;
  @ApiProperty({ description: 'The rank of the user in the leaderboard' })
  @Expose()
  rank: number;
  @ApiProperty({ description: 'The ZTH balance of the user' })
  @Expose()
  zthBalance: number;

  constructor(
    user: Partial<UserResponseDto>,
    rank: number,
    zthBalance: number,
  ) {
    Object.assign(this.user, user);
    this.rank = rank;
    this.zthBalance = zthBalance;
  }
}

export class LeaderboardDto {
  @ApiProperty({ description: 'The leaderboard items' })
  @Expose()
  leaderboard: Array<LeaderboardItem>;
  @ApiProperty({ description: 'The total number of users in the leaderboard' })
  @Expose()
  total: number;
}
