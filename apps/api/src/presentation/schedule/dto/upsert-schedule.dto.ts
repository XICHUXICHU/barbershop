import {
  IsString,
  IsInt,
  IsBoolean,
  Matches,
  Min,
  Max,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpsertScheduleDto {
  @ApiProperty()
  @IsString()
  barbershopId!: string;

  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday … 6=Saturday" })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: "09:00" })
  @Matches(/^\d{2}:\d{2}$/)
  openTime!: string;

  @ApiProperty({ example: "19:00" })
  @Matches(/^\d{2}:\d{2}$/)
  closeTime!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isOpen!: boolean;
}
