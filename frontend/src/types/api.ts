export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  profilePictureUrl: string;
  bannerUrl: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  zthBalance: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

export interface Memecoin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  totalSupply: number;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  creator: User;
  creatorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletHolding {
  id: string;
  walletId: string;
  memecoin: Memecoin;
  memecoinId: string;
  amount: number;
  valueUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  address: string;
  balance: number;
  ownerId: string;
  holdings: WalletHolding[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'create';
  amount: number;
  price: number;
  totalValue: number;
  user: User;
  userId: string;
  memecoin: Memecoin;
  memecoinId: string;
  createdAt: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  email: string;
}

export interface ChangePasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponseDto {
  accessToken: string;
  userId: string;
  username: string;
  email: string;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
  profilePictureUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  backgroundColor: string;
  textColor: string;
  createdAt: string;
  updatedAt: string;
  zthBalance: number;
  rank: number;
}

export interface UpdateUserDto {
  username?: string;
  fullName?: string;
  profilePictureUrl?: string;
  bannerUrl?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface MemecoinResponseDto {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  totalSupply: number;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  creator: UserResponseDto;
  creatorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemecoinDto {
  name: string;
  symbol: string;
  description?: string;
  logoUrl?: string;
}

export interface MemecoinPriceDto {
  price: number;
  supply: number;
  marketSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface WalletHoldingResponseDto {
  id: string;
  walletId: string;
  memecoin: MemecoinResponseDto;
  memecoinId: string;
  amount: number;
  valueUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponseDto {
  id: string;
  address: string;
  balance: number;
  ownerId: string;
  holdings: WalletHoldingResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponseDto {
  id: string;
  type: 'buy' | 'sell' | 'create';
  amount: number;
  price: number;
  totalValue: number;
  user: UserResponseDto;
  userId: string;
  memecoin: MemecoinResponseDto;
  memecoinId: string;
  createdAt: string;
}

export interface BuyMemecoinDto {
  memecoinId: string;
  amount: number;
  slippageTolerance?: number;
}

export interface SellMemecoinDto {
  memecoinId: string;
  amount: number;
  slippageTolerance?: number;
}

export interface TradeResponseDto {
  transactionId: string;
  type: 'buy' | 'sell' | 'create';
  memecoinId: string;
  memecoinSymbol: string;
  amount: number;
  price: number;
  totalValue: number;
  newBalance: number;
  newHoldingAmount: number;
  executedAt: string;
}

export interface MemecoinVolumeDto {
  id: string;
  ticker: string;
  volume: number;
}

export interface TradingVolumeDto {
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  timeframe: '24h' | '7d' | '30d';
  memecoins: MemecoinVolumeDto[];
}

export interface LeaderboardResponse {
  users: UserResponseDto[];
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
} 