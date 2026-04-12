import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Inject } from "@nestjs/common";
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from "../../domain/repositories";
import { CreateServiceDto } from "./dto/create-service.dto";

@ApiTags("Services")
@Controller("services")
export class ServiceController {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepo: IServiceRepository,
  ) {}

  @Get("barbershop/:barbershopId")
  @ApiOperation({ summary: "List services of a barbershop" })
  async findByBarbershop(@Param("barbershopId") barbershopId: string) {
    return this.serviceRepo.findByBarbershop(barbershopId);
  }

  @Post()
  @ApiOperation({ summary: "Create a new service" })
  async create(@Body() dto: CreateServiceDto) {
    return this.serviceRepo.create({
      barbershopId: dto.barbershopId,
      name: dto.name,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      durationMinutes: dto.durationMinutes,
      priceAmount: dto.priceAmount,
      priceCurrency: dto.priceCurrency ?? "USD",
      isActive: true,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a service" })
  async update(
    @Param("id") id: string,
    @Body() body: Partial<CreateServiceDto>,
  ) {
    return this.serviceRepo.update(id, body as any);
  }
}
