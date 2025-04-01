import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { TransactionType } from '../../entities/transaction.entity';
import { PublicUserResponseDto } from '../../user/dto';

@Exclude()
export class TransactionResponseDto {
  @ApiProperty({ description: 'The unique identifier of the transaction' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The unique identifier of the user' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'The user' })
  @Expose()
  @Type(() => PublicUserResponseDto)
  user?: PublicUserResponseDto;

  @ApiProperty({ description: 'The unique identifier of the memecoin' })
  @Expose()
  memecoinId: string;

  @ApiProperty({ description: 'The type of the transaction' })
  @Expose()
  type: TransactionType;

  @ApiProperty({ description: 'The amount of memecoin' })
  @Expose()
  memecoinAmount: string;

  @ApiProperty({ description: 'The amount of ZTH' })
  @Expose()
  zthAmount: string;

  @ApiProperty({ description: 'The price of the transaction' })
  @Expose()
  price: string;

  @ApiProperty({ description: 'The date when the transaction was created' })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
}
