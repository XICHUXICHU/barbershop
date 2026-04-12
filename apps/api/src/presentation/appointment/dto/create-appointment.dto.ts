import { IsString, IsOptional, Matches, IsEmail } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  barbershopId!: string;

  @ApiProperty()
  @IsString()
  barberId!: string;

  @ApiProperty()
  @IsString()
  serviceId!: string;

  @ApiProperty({ example: "Carlos López" })
  @IsString()
  customerName!: string;

  @ApiProperty({ example: "+5215512345678" })
  @IsString()
  customerPhone!: string;

  @ApiPropertyOptional({ example: "carlos@email.com" })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ example: "2026-04-15" })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "date must be YYYY-MM-DD" })
  date!: string;

  @ApiProperty({ example: "10:00" })
  @Matches(/^\d{2}:\d{2}$/, { message: "startTime must be HH:mm" })
  startTime!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
