import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { WalletHolding } from './wallet-holding.entity';
import { Exclude } from 'class-transformer';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  zthBalance: string;

  @Column()
  ownerId: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'ownerId' })
  owner?: User;

  @OneToMany(() => WalletHolding, (holding) => holding.wallet)
  holdings?: WalletHolding[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
