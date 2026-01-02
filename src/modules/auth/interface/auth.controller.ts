import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { LoginUseCase } from '../application/login.usecase';
import { RegisterUseCase } from '../application/register.usecase';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인합니다.',
  })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: '회사 등록',
    description: '새로운 회사와 관리자 계정을 생성합니다.',
  })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }
}
