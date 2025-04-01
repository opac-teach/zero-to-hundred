export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  userTitle?: string;
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

export interface PublicUserResponseDto {
  id: string;
  username: string;
  userTitle: string;
  profilePictureUrl: string;
  bannerUrl: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MyUserResponseDto extends PublicUserResponseDto {
  email: string;
}

export interface UserResponseWithWalletDto extends PublicUserResponseDto {
  wallet: WalletResponseDto;
}

export interface UserProfileResponseDto extends PublicUserResponseDto {
  transactions: TransactionResponseDto[];
  wallet: WalletResponseDto;
  createdMemecoins: MemecoinResponseDto[];
  rank: number;
}

export interface UpdateUserDto {
  username?: string;
  userTitle?: string;
  profilePictureUrl?: string;
  bannerUrl?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface BondingCurveConfigDto {
  slope: string;
  startingPrice: string;
  curveType: "linear" | "exponential";
}

export interface MemecoinResponseDto {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  creator: PublicUserResponseDto;
  creatorId: string;
  totalSupply: string;
  currentPrice: string;
  volume24h: string;
  createdAt: string;
  updatedAt: string;
  curveConfig: BondingCurveConfigDto;
}

export interface CreateMemecoinDto {
  name: string;
  symbol: string;
  description?: string;
  logoUrl?: string;
  curveConfig: BondingCurveConfigDto;
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
  owner: PublicUserResponseDto;
  holdings: WalletHoldingResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponseDto {
  id: string;
  type: "BUY" | "SELL" | "CREATE";
  memecoinAmount: string;
  zthAmount: string;
  price: string;
  user: PublicUserResponseDto;
  userId: string;
  memecoin: MemecoinResponseDto;
  memecoinId: string;
  createdAt: string;
}

export interface TradeMemecoinDto {
  memecoinId: string;
  memecoinAmount: string;
  requestZthAmount: string;
  slippageTolerance?: number;
  tradeType: "buy" | "sell";
}

export interface TradeResponseDto {
  transaction: TransactionResponseDto;
  memecoin: MemecoinResponseDto;
  walletHolding: WalletHoldingResponseDto;
  wallet: WalletResponseDto;
}

export interface TradeEstimationResponseDto {
  memecoin: MemecoinResponseDto;
  zthAmount: string;
  memecoinAmount: string;
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
  user: UserResponseWithWalletDto;
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
