import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBarberDto {
  @ApiProperty({ example: "uuid-of-barbershop" })
  @IsString()
  barbershopId!: string;

  @ApiProperty({ example: "Juan Pérez" })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
