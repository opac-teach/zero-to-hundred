import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MemecoinService } from './memecoin.service';
import { CreateMemecoinDto, MemecoinResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionResponseDto } from './dto/transaction.dto';
import { WalletHoldingResponseDto } from 'src/wallet/dto';

@ApiTags('memecoins')
@Controller('memecoins')
export class MemecoinController {
  constructor(private readonly memecoinService: MemecoinService) {}

  @ApiOperation({ summary: 'Get all memecoins' })
  @ApiResponse({
    status: 200,
    description: 'Return all memecoins',
    type: [MemecoinResponseDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['createdAt', 'name', 'symbol', 'totalSupply'],
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<MemecoinResponseDto[]> {
    return this.memecoinService.findAll(page, limit, sortBy, order);
  }

  @ApiOperation({ summary: 'Get memecoin by symbol' })
  @ApiResponse({
    status: 200,
    description: 'Return the memecoin',
    type: MemecoinResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Memecoin not found' })
  @ApiParam({ name: 'symbol', description: 'The symbol of the memecoin' })
  @Get(':symbol')
  async findBySymbol(
    @Param('symbol') symbol: string,
  ): Promise<MemecoinResponseDto> {
    return this.memecoinService.findBySymbol(symbol);
  }

  @ApiOperation({ summary: 'Create a new memecoin' })
  @ApiResponse({
    status: 201,
    description: 'Memecoin successfully created',
    type: MemecoinResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Memecoin with this name or symbol already exists',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createMemecoinDto: CreateMemecoinDto,
  ): Promise<MemecoinResponseDto> {
    return this.memecoinService.create(req.user.id, createMemecoinDto);
  }

  @ApiOperation({ summary: 'Get memecoin transactions' })
  @ApiResponse({
    status: 200,
    description: 'Return the memecoin transactions',
    type: [TransactionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Memecoin not found' })
  @ApiParam({ name: 'symbol', description: 'The symbol of the memecoin' })
  @Get(':symbol/transactions')
  async getTransactions(
    @Param('symbol') symbol: string,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.memecoinService.getTransactions(symbol);
    return transactions.map(
      (transaction) => new TransactionResponseDto(transaction),
    );
  }
  @ApiOperation({ summary: 'Get memecoin transactions' })
  @ApiResponse({
    status: 200,
    description: 'Return the memecoin transactions',
    type: [TransactionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Memecoin not found' })
  @ApiParam({ name: 'symbol', description: 'The symbol of the memecoin' })
  @Get(':symbol/holdings')
  async getHoldings(
    @Param('symbol') symbol: string,
  ): Promise<WalletHoldingResponseDto[]> {
    const holdings = await this.memecoinService.getHoldings(symbol);
    return holdings.map((holding) => new WalletHoldingResponseDto(holding));
  }
}
