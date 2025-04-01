import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MemecoinResponseDto } from '../../memecoin/dto';
import { TransactionType } from '../../entities/transaction.entity';
import { PublicUserResponseDto } from '../../user/dto/user-response.dto';

@Exclude()
export class TransactionResponseDto {
  @ApiProperty({ description: 'The unique identifier of the transaction' })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The type of transaction',
    enum: TransactionType,
  })
  @Expose()
  type: TransactionType;

  @ApiProperty({
    description: 'The amount of the memecoin involved in the transaction',
  })
  @Expose()
  memecoinAmount: string;

  @ApiProperty({ description: 'The total value of the transaction in ZTH' })
  @Expose()
  zthAmount: string;

  @ApiProperty({
    description: 'The price of the memecoin at the time of the transaction',
  })
  @Expose()
  price: string;

  @ApiProperty({
    description: 'The user who performed the transaction',
    type: () => PublicUserResponseDto,
  })
  @Expose()
  @Type(() => PublicUserResponseDto)
  user?: PublicUserResponseDto;

  @ApiProperty({ description: 'The ID of the user' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'The memecoin involved in the transaction' })
  @Expose()
  @Type(() => MemecoinResponseDto)
  memecoin?: MemecoinResponseDto;

  @ApiProperty({ description: 'The ID of the memecoin' })
  @Expose()
  memecoinId: string;

  @ApiProperty({ description: 'The date when the transaction was created' })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
}
