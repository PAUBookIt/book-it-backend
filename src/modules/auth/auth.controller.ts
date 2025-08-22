import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login to get a JWT token' })
  @ApiBody({
    schema: { example: { email: 'user@example.com', password: 'password123' } },
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful, returns a JWT token',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // @Post('verify')
  // verify(){
  //   return this.authService.verify()
  // }

  // @Post('refresh')
  // refresh(){
  //   return this.authService.refresh()
  // }

  //   @Post('profile')
  //   profile(){
  //     return this.authService.profile()
  //   }
}
