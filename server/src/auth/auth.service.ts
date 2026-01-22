import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DRIZZLE_DB, AUTH_SCHEMAS } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(DRIZZLE_DB) private readonly db: any,
    @Inject(AUTH_SCHEMAS) private readonly schemas: { users: any; refreshTokens: any },
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    const [existingUser] = await this.db.select().from(this.schemas.users).where(eq(this.schemas.users.email, email));

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Split name into firstName and lastName
    const nameParts = (name || 'User Name').split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Name';

    const [user] = await this.db.insert(this.schemas.users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ideas_reader',
      status: 'active',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    const payload = { sub: user.email, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const [user] = await this.db.select().from(this.schemas.users).where(eq(this.schemas.users.email, email));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.email, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async validateUser(email: string): Promise<any | null> {
    const [user] = await this.db.select().from(this.schemas.users).where(eq(this.schemas.users.email, email));
    return user || null;
  }
}
