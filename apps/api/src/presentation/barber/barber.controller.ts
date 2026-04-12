import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Inject } from "@nestjs/common";
import {
  BARBER_REPOSITORY,
  IBarberRepository,
} from "../../domain/repositories";
import { CreateBarberDto } from "./dto/create-barber.dto";

@ApiTags("Barbers")
@Controller("barbers")
export class BarberController {
  constructor(
    @Inject(BARBER_REPOSITORY)
    private readonly barberRepo: IBarberRepository,
  ) {}

  @Get("barbershop/:barbershopId")
  @ApiOperation({ summary: "List barbers of a barbershop" })
  async findByBarbershop(@Param("barbershopId") barbershopId: string) {
    return this.barberRepo.findByBarbershop(barbershopId);
  }

  @Post()
  @ApiOperation({ summary: "Add a barber to a barbershop" })
  async create(@Body() dto: CreateBarberDto) {
    return this.barberRepo.create({
      barbershopId: dto.barbershopId,
      name: dto.name,
      avatarUrl: dto.avatarUrl ?? null,
      isActive: true,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a barber" })
  async update(
    @Param("id") id: string,
    @Body() body: Partial<CreateBarberDto>,
  ) {
    return this.barberRepo.update(id, body as any);
  }
}
