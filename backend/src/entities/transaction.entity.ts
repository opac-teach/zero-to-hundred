import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Memecoin } from './memecoin.entity';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  CREATE = 'CREATE',
}

@Entity('transactions')
export class Transaction {
  @ApiProperty({ description: 'The unique identifier of the transaction' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The user who performed the transaction' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ApiProperty({ description: 'The memecoin involved in the transaction' })
  @ManyToOne(() => Memecoin)
  @JoinColumn({ name: 'memecoinId' })
  memecoin: Memecoin;

  @Column()
  memecoinId: string;

  @ApiProperty({
    description: 'The type of transaction',
    enum: TransactionType,
  })
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'The amount of memecoins  involved in the transaction',
  })
  @Column({ type: 'decimal', precision: 24, scale: 8 })
  memeCoinAmount: string;

  @ApiProperty({ description: 'The total value of the transaction in ZTH' })
  @Column({ type: 'decimal', precision: 24, scale: 8 })
  zthAmount: string;

  @ApiProperty({
    description: 'The price per token at the time of the transaction',
  })
  @Column({ type: 'decimal', precision: 24, scale: 8 })
  price: string;

  @ApiProperty({ description: 'The date when the transaction was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the transaction was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
