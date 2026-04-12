import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GetAvailableSlotsUseCase } from "../../application/use-cases";

@ApiTags("Availability")
@Controller("availability")
export class AvailabilityController {
  constructor(private readonly getSlots: GetAvailableSlotsUseCase) {}

  @Get()
  @ApiOperation({
    summary: "Get available time slots for a barber on a specific date",
  })
  @ApiQuery({ name: "barbershopId", required: true })
  @ApiQuery({ name: "barberId", required: true })
  @ApiQuery({ name: "serviceId", required: true })
  @ApiQuery({ name: "date", required: true, example: "2026-04-15" })
  async getAvailableSlots(
    @Query("barbershopId") barbershopId: string,
    @Query("barberId") barberId: string,
    @Query("serviceId") serviceId: string,
    @Query("date") date: string,
  ) {
    return this.getSlots.execute(barbershopId, barberId, serviceId, date);
  }
}
