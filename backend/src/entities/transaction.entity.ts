import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Memecoin } from './memecoin.entity';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  CREATE = 'CREATE',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Memecoin)
  @JoinColumn({ name: 'memecoinId' })
  memecoin: Memecoin;

  @Column()
  memecoinId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  memecoinAmount: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  zthAmount: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  price: string;

  @CreateDateColumn()
  createdAt: Date;
}
