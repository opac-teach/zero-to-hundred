import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  userTitle: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: '#f5f5f5' })
  backgroundColor: string;

  @Column({ default: '#333333' })
  textColor: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  bot: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.owner)
  wallet?: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions?: Transaction[];
}
