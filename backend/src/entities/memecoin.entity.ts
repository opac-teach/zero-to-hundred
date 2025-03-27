import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { WalletHolding } from './wallet-holding.entity';
import {
  BondingCurveConfig,
  defaultCurveConfig,
} from '../trading/bonding-curve';

@Entity('memecoins')
export class Memecoin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  symbol: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '1' })
  totalSupply: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '1' })
  currentPrice: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  volume24h: string;

  @OneToMany(() => Transaction, (transaction) => transaction.memecoin)
  transactions: Transaction[];

  @OneToMany(() => WalletHolding, (holding) => holding.memecoin)
  holdings: WalletHolding[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', default: defaultCurveConfig })
  curveConfig: BondingCurveConfig;
}
