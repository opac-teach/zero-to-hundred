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
import { Wallet } from './wallet.entity';
import { Memecoin } from './memecoin.entity';

@Entity('wallet_holdings')
export class WalletHolding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  walletId: string;

  @ManyToOne(() => Memecoin)
  @JoinColumn({ name: 'memecoinId' })
  memecoin: Memecoin;

  @Column()
  memecoinId: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  amount: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
