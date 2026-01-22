import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class AzureAuthDto {
  @IsString()
  azureId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  tenantId: string;

  @IsUrl()
  @IsOptional()
  profilePicture?: string;
}

export class LinkAzureAccountDto {
  @IsString()
  accessToken: string;
}
