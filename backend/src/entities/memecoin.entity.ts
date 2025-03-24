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
  @ApiProperty({ description: 'The unique identifier of the memecoin' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the memecoin' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The symbol of the memecoin' })
  @Column({ unique: true })
  symbol: string;

  @ApiProperty({ description: 'The description of the memecoin' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'The URL of the memecoin logo' })
  @Column({ nullable: true })
  logoUrl: string;

  @ApiProperty({ description: 'The creator of the memecoin' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @ApiProperty({ description: 'The total supply of the memecoin' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: '1' })
  totalSupply: string;

  @ApiProperty({ description: 'The current price of the memecoin in ZTH' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: '1' })
  currentPrice: string;

  @ApiProperty({ description: 'The 24-hour trading volume in ZTH' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  volume24h: string;

  @ApiProperty({
    description: 'The transactions associated with this memecoin',
  })
  @OneToMany(() => Transaction, (transaction) => transaction.memecoin)
  transactions: Transaction[];

  @ApiProperty({ description: 'The wallet holdings of this memecoin' })
  @OneToMany(() => WalletHolding, (holding) => holding.memecoin)
  holdings: WalletHolding[];

  @ApiProperty({ description: 'The date when the memecoin was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the memecoin was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'The bonding curve configuration' })
  @Column({ type: 'jsonb', default: defaultCurveConfig })
  curveConfig: BondingCurveConfig;
}
