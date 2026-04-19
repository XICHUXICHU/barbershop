import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { ClerkAuthGuard, CurrentUser } from "../../infrastructure/auth";

const MAX_PHOTOS_PER_SHOP = 20;

@ApiTags("Gallery")
@Controller("gallery")
export class GalleryController {
  constructor(private readonly prisma: PrismaService) {}

  /* ─── Public: list gallery photos ─── */
  @Get("barbershop/:barbershopId")
  @ApiOperation({ summary: "List gallery photos for a barbershop (public)" })
  async list(@Param("barbershopId") barbershopId: string) {
    return this.prisma.galleryPhoto.findMany({
      where: { barbershopId },
      orderBy: { createdAt: "desc" },
    });
  }

  /* ─── Protected: add photo ─── */
  @Post("barbershop/:barbershopId")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add a photo to the gallery (owner only)" })
  async add(
    @Param("barbershopId") barbershopId: string,
    @Body() body: { imageUrl: string; caption?: string },
    @CurrentUser("userId") userId: string,
  ) {
    // Verify ownership
    const shop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });
    if (!shop || shop.ownerId !== userId) {
      throw new ForbiddenException("No tienes permiso para esta barbería");
    }

    // Check limit
    const count = await this.prisma.galleryPhoto.count({
      where: { barbershopId },
    });
    if (count >= MAX_PHOTOS_PER_SHOP) {
      throw new BadRequestException(
        `Límite alcanzado: máximo ${MAX_PHOTOS_PER_SHOP} fotos por barbería`,
      );
    }

    return this.prisma.galleryPhoto.create({
      data: {
        barbershopId,
        imageUrl: body.imageUrl,
        caption: body.caption ?? null,
      },
    });
  }

  /* ─── Protected: delete photo ─── */
  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a gallery photo (owner only)" })
  async remove(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string,
  ) {
    const photo = await this.prisma.galleryPhoto.findUnique({
      where: { id },
      include: { barbershop: { select: { ownerId: true } } },
    });

    if (!photo) {
      throw new BadRequestException("Foto no encontrada");
    }

    if (photo.barbershop.ownerId !== userId) {
      throw new ForbiddenException("No tienes permiso para eliminar esta foto");
    }

    await this.prisma.galleryPhoto.delete({ where: { id } });
    return { deleted: true };
  }
}
