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
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { WalletHolding } from './wallet-holding.entity';
import { Exclude, Type } from 'class-transformer';

@Entity('wallets')
export class Wallet {
  @ApiProperty({ description: 'The unique identifier of the wallet' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The owner of the wallet' })
  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'ownerId' })
  @Exclude({ toPlainOnly: true })
  owner: User;

  @Column()
  ownerId: string;

  @ApiProperty({ description: 'The ZTH balance in the wallet' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  zthBalance: string;

  @ApiProperty({ description: 'The holdings in this wallet' })
  @OneToMany(() => WalletHolding, (holding) => holding.wallet)
  holdings: WalletHolding[];

  @ApiProperty({ description: 'The date when the wallet was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the wallet was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
