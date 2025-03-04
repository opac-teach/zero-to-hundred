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
  @ApiProperty({ description: 'The unique identifier of the wallet holding' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The wallet that holds the memecoin' })
  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  walletId: string;

  @ApiProperty({ description: 'The memecoin that is held' })
  @ManyToOne(() => Memecoin)
  @JoinColumn({ name: 'memecoinId' })
  memecoin: Memecoin;

  @Column()
  memecoinId: string;

  @ApiProperty({ description: 'The amount of the memecoin held' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  amount: string;

  @ApiProperty({ description: 'The date when the holding was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the holding was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
