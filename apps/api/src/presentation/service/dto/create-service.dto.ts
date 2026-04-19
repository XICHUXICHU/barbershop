import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateServiceDto {
  @ApiProperty({ example: "uuid-of-barbershop" })
  @IsString()
  barbershopId!: string;

  @ApiProperty({ example: "Classic Haircut" })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: "Traditional scissors & clipper cut" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 30, description: "Duration in minutes" })
  @IsInt()
  @Min(5)
  durationMinutes!: number;

  @ApiProperty({ example: 150, description: "Precio en pesos enteros (MXN)" })
  @IsInt()
  @Min(0)
  priceAmount!: number;

  @ApiPropertyOptional({ example: "MXN" })
  @IsOptional()
  @IsString()
  priceCurrency?: string;
}
