import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SellMemecoinDto } from './sell-memecoin.dto';

describe('SellMemecoinDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10,
      requestPrice: 0.1,
      slippageTolerance: 1.5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid DTO without optional slippageTolerance', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10,
      requestPrice: 0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if memecoinId is missing', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      amount: 10,
      requestPrice: 0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('memecoinId');
  });

  it('should fail validation if memecoinId is empty', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '',
      amount: 10,
      requestPrice: 0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('memecoinId');
  });

  it('should fail validation if amount is missing', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      requestPrice: 0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail validation if amount is zero', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 0,
      requestPrice: 0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail validation if amount is negative', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: -10,
      requestPrice: 0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail validation if requestPrice is missing', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('requestPrice');
  });

  it('should fail validation if requestPrice is zero', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10,
      requestPrice: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('requestPrice');
  });

  it('should fail validation if requestPrice is negative', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10,
      requestPrice: -0.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('requestPrice');
  });

  it('should fail validation if slippageTolerance is negative', async () => {
    const dto = plainToInstance(SellMemecoinDto, {
      memecoinId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 10,
      requestPrice: 0.1,
      slippageTolerance: -1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('slippageTolerance');
  });
});
