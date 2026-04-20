import { IsString, IsOptional, Matches, MaxLength, IsBoolean } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBarbershopDto {
  @ApiProperty({ example: "user_2abc123" })
  @IsString()
  ownerId!: string;

  @ApiProperty({ example: "Fresh Cuts Barber" })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "fresh-cuts" })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be lowercase alphanumeric with hyphens",
  })
  @MaxLength(60)
  slug!: string;

  @ApiProperty({ example: "+1234567890" })
  @IsString()
  phone!: string;

  @ApiProperty({ example: "123 Main St, City" })
  @IsString()
  address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  servicesPosterUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
