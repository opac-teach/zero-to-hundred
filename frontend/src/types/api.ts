export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profilePictureUrl: string;
  bannerUrl: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Memecoin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  creator: User;
  creatorId: string;
  totalSupply: string;
  currentPrice: string;
  volume24h: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletHolding {
  id: string;
  walletId: string;
  memecoin: Memecoin;
  memecoinId: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  zthBalance: string;
  ownerId: string;
  owner: User;
  holdings: WalletHolding[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "CREATE";
  memeCoinAmount: string;
  zthAmount: string;
  price: string;
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
  fullName: string;
  profilePictureUrl: string;
  bannerUrl: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UserWithWalletResponseDto extends UserResponseDto {
  wallet: WalletResponseDto;
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
  creator: UserResponseDto;
  creatorId: string;
  totalSupply: string;
  currentPrice: string;
  marketCap: string;
  volume24h: string;
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
  price: string;
  supply: string;
  marketSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
}

export interface WalletHoldingResponseDto {
  id: string;
  walletId: string;
  memecoin: MemecoinResponseDto;
  memecoinId: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponseDto {
  id: string;
  zthBalance: string;
  ownerId: string;
  owner: UserResponseDto;
  holdings: WalletHoldingResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponseDto {
  id: string;
  type: "BUY" | "SELL" | "CREATE";
  memeCoinAmount: string;
  zthAmount: string;
  price: string;
  user: UserResponseDto;
  userId: string;
  memecoin: MemecoinResponseDto;
  memecoinId: string;
  createdAt: string;
}

export interface TradeMemecoinDto {
  memecoinId: string;
  amount: string;
  requestCost: string;
  slippageTolerance?: number;
  tradeType: "buy" | "sell";
}

export interface TradeResponseDto {
  transaction: TransactionResponseDto;
  memecoin: MemecoinResponseDto;
  walletHolding: WalletHoldingResponseDto;
}

export interface TradeEstimationResponseDto {
  memecoin: MemecoinResponseDto;
  cost: string;
  amount: string;
}

export interface MemecoinVolumeDto {
  id: string;
  ticker: string;
  volume: string;
}

export interface TradingVolumeDto {
  totalVolume: string;
  buyVolume: string;
  sellVolume: string;
  timeframe: "24h" | "7d" | "30d";
  memecoins: MemecoinVolumeDto[];
}

export interface LeaderboardItemDto {
  user: UserWithWalletResponseDto;
  rank: number;
}

export interface LeaderboardDto {
  leaderboard: LeaderboardItemDto[];
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
