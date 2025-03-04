import axios from 'axios';
import type {
  UserResponseDto,
  MemecoinResponseDto,
  WalletResponseDto,
  TransactionResponseDto,
  RegisterDto,
  LoginDto,
  CreateMemecoinDto,
  BuyMemecoinDto,
  SellMemecoinDto,
  TradeResponseDto,
  MemecoinPriceDto,
  TradingVolumeDto,
  LeaderboardResponse,
  ApiError,
  AuthResponseDto,
  UpdateUserDto,
} from '@/types/api';
import router from '@/router';
import { useUserStore } from '@/stores/user';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3000/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.clearToken();
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (data: RegisterDto) => api.post<AuthResponseDto>('/auth/register', data),
  login: (data: LoginDto) => api.post<AuthResponseDto>('/auth/login', data),
  resetPassword: (email: string) => api.post('/auth/reset-password', { email }),
  changePassword: (token: string, password: string, confirmPassword: string) =>
    api.post('/auth/change-password', { token, password, confirmPassword }),
};

// User endpoints
export const users = {
  getAll: () => api.get<UserResponseDto[]>('/users'),
  getById: (id: string) => api.get<UserResponseDto>(`/users/${id}`),
  getByUsername: (username: string) => api.get<UserResponseDto>(`/users/username/${username}`),
  getProfile: () => api.get<UserResponseDto>('/users/me/profile'),
  updateProfile: (data: UpdateUserDto) => api.put<UserResponseDto>('/users/me/profile', data),
  getLeaderboard: (page?: number, limit?: number) =>
    api.get<LeaderboardResponse>('/users/leaderboard', { params: { page, limit } }),
};

// Memecoin endpoints
export const memecoins = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    sortBy?: 'createdAt' | 'name' | 'symbol' | 'totalSupply'; 
    order?: 'ASC' | 'DESC' 
  }) => {
    // Create query params with only the parameters we want to send
    const queryParams: Record<string, any> = {};
    
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.limit !== undefined) queryParams.limit = params.limit;
    if (params?.sortBy !== undefined) queryParams.sortBy = params.sortBy;
    if (params?.order !== undefined) queryParams.order = params.order;

    return api.get<MemecoinResponseDto[]>('/memecoins', { params: queryParams });
  },
  getById: (id: string) => api.get<MemecoinResponseDto>(`/memecoins/${id}`),
  getBySymbol: (symbol: string) => api.get<MemecoinResponseDto>(`/memecoins/symbol/${symbol}`),
  create: (data: CreateMemecoinDto) => api.post<MemecoinResponseDto>('/memecoins', data),
  getPrice: (id: string) => api.get<MemecoinPriceDto>(`/memecoins/${id}/price`),
  getTransactions: (id: string, page?: number, limit?: number) => 
    api.get<TransactionResponseDto[]>(`/memecoins/${id}/transactions`, { params: { page, limit } }),
};

// Wallet endpoints
export const wallet = {
  getWallet: () => api.get<WalletResponseDto>('/wallet'),
  getTransactions: (page?: number, limit?: number) => 
    api.get<TransactionResponseDto[]>('/wallet/transactions', { params: { page, limit } }),
};

// Trading endpoints
export const trading = {
  buy: (data: BuyMemecoinDto) => api.post<TradeResponseDto>('/trading/buy', data),
  sell: (data: SellMemecoinDto) => api.post<TradeResponseDto>('/trading/sell', data),
};

// Statistics endpoints
export const statistics = {
  getTradingVolume: (params?: { timeframe?: '24h' | '7d' | '30d'; memecoinId?: string }) =>
    api.get<TradingVolumeDto>('/statistics/trading-volume', { params }),
}; 