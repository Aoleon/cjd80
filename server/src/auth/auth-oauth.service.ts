import { Injectable, Inject, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DRIZZLE_DB, AUTH_SCHEMAS } from './auth.constants';
import { eq } from 'drizzle-orm';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthOAuthService {
  private readonly logger = new Logger(AuthOAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE_DB) private readonly db: any,
    @Inject(AUTH_SCHEMAS) private readonly schemas: { users: any; refreshTokens: any },
  ) {}

  /**
   * Handle Azure AD OAuth login or registration
   */
  async azureAuth(azureData: {
    azureId: string;
    email: string;
    name?: string;
    tenantId?: string;
    profilePicture?: string;
  }): Promise<AuthResponseDto> {
    const { azureId, email, name, tenantId, profilePicture } = azureData;

    // Check if user already exists with this Azure ID
    let [user] = await this.db
      .select()
      .from(this.schemas.users)
      .where(eq(this.schemas.users.azureId, azureId));

    if (user) {
      // User exists with Azure account - update last login time
      await this.db
        .update(this.schemas.users)
        .set({
          azureLinkedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(this.schemas.users.id, user.id));
    } else {
      // Check if user exists with this email (link account)
      [user] = await this.db.select().from(this.schemas.users).where(eq(this.schemas.users.email, email));

      if (user) {
        // Link Azure account to existing user
        if (user.azureId) {
          throw new ConflictException('Azure account already linked to another user');
        }

        await this.db
          .update(this.schemas.users)
          .set({
            azureId,
            azureEmail: email,
            azureTenantId: tenantId,
            azureProfilePicture: profilePicture,
            azureLinkedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(this.schemas.users.id, user.id));

        // Fetch updated user
        [user] = await this.db.select().from(this.schemas.users).where(eq(this.schemas.users.id, user.id));
      } else {
        // Create new user with Azure account
        const [newUser] = await this.db
          .insert(this.schemas.users)
          .values({
            email,
            name: name || null,
            role: 'user',
            azureId,
            azureEmail: email,
            azureTenantId: tenantId,
            azureProfilePicture: profilePicture,
            azureLinkedAt: new Date(),
            password: null, // No password for OAuth-only accounts
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        user = newUser;
      }
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Link Azure account to existing authenticated user
   */
  async linkAzureAccount(
    userId: string,
    azureData: {
      azureId: string;
      email: string;
      tenantId?: string;
      profilePicture?: string;
    },
  ): Promise<{ message: string }> {
    const { azureId, email, tenantId, profilePicture } = azureData;

    // Check if Azure ID already linked to another user
    const [existingAzureUser] = await this.db
      .select()
      .from(this.schemas.users)
      .where(eq(this.schemas.users.azureId, azureId));

    if (existingAzureUser && existingAzureUser.id !== userId) {
      throw new ConflictException('This Azure account is already linked to another user');
    }

    // Link Azure account
    await this.db
      .update(this.schemas.users)
      .set({
        azureId,
        azureEmail: email,
        azureTenantId: tenantId,
        azureProfilePicture: profilePicture,
        azureLinkedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(this.schemas.users.id, userId));

    this.logger.log(`Azure account linked to user ${userId}`);

    return { message: 'Azure account linked successfully' };
  }
}
