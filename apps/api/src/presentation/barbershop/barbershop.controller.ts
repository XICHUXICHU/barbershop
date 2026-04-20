import { Controller, Get, Post, Patch, Param, Body, Inject, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import {
  CreateBarbershopUseCase,
} from "../../application/use-cases";
import {
  BARBERSHOP_REPOSITORY,
  IBarbershopRepository,
} from "../../domain/repositories";
import { CreateBarbershopDto } from "./dto/create-barbershop.dto";
import { ClerkAuthGuard, CurrentUser } from "../../infrastructure/auth";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@ApiTags("Barbershops")
@Controller("barbershops")
export class BarbershopController {
  constructor(
    private readonly createBarbershop: CreateBarbershopUseCase,
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepo: IBarbershopRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all barbershops (admin)" })
  async findAll() {
    return this.prisma.barbershop.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Get("by-owner/:ownerId")
  @ApiOperation({ summary: "List barbershops by owner (Clerk userId)" })
  async findByOwner(@Param("ownerId") ownerId: string) {
    return this.prisma.barbershop.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
  }

  @Get("by-id/:id")
  @ApiOperation({ summary: "Get barbershop by ID" })
  async findById(@Param("id") id: string) {
    return this.prisma.barbershop.findUnique({ where: { id } });
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get barbershop by slug (public)" })
  async findBySlug(@Param("slug") slug: string) {
    return this.prisma.barbershop.findUnique({ where: { slug } });
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register a new barbershop" })
  async create(@Body() dto: CreateBarbershopDto) {
    return this.createBarbershop.execute(dto);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update barbershop details" })
  async update(
    @Param("id") id: string,
    @Body() body: Partial<CreateBarbershopDto>,
    @CurrentUser("userId") userId: string,
    @CurrentUser("role") role: string | null,
  ) {
    const shop = await this.prisma.barbershop.findUnique({ where: { id } });
    if (!shop || (shop.ownerId !== userId && role !== "admin")) {
      throw new ForbiddenException("No tienes permiso para editar esta barbería");
    }
    return this.prisma.barbershop.update({ where: { id }, data: body as any });
  }
}
