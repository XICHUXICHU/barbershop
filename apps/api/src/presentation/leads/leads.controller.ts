import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { ClerkAuthGuard, Roles } from "../../infrastructure/auth";
import { ConfigService } from "@nestjs/config";

interface PlaceResult {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  totalRatings: number | null;
}

@ApiTags("Leads")
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Roles("admin")
@Controller("admin/leads")
export class LeadsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ──────── Search Google Places ────────
  @Get("search")
  @ApiOperation({ summary: "Search barbershops/salons via Google Places API" })
  async searchPlaces(
    @Query("query") query: string,
    @Query("pageToken") pageToken?: string,
  ) {
    if (!query || query.trim().length < 3) {
      throw new HttpException(
        "La búsqueda debe tener al menos 3 caracteres",
        HttpStatus.BAD_REQUEST,
      );
    }

    const apiKey = this.config.get<string>("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      throw new HttpException(
        "GOOGLE_PLACES_API_KEY no está configurada en el servidor",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.nationalPhoneNumber",
      "places.internationalPhoneNumber",
      "places.websiteUri",
      "places.googleMapsUri",
      "places.rating",
      "places.userRatingCount",
      "places.businessStatus",
    ].join(",");

    const body: Record<string, any> = {
      textQuery: query,
      languageCode: "es",
      maxResultCount: 20,
    };

    if (pageToken) {
      body.pageToken = pageToken;
    }

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask + ",nextPageToken",
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new HttpException(
        `Error de Google Places API: ${res.status} - ${err}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data: any = await res.json();

    // Get already saved placeIds to mark them
    const places: PlaceResult[] = (data.places ?? []).map((p: any) => ({
      placeId: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? null,
      phone:
        p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? null,
      website: p.websiteUri ?? null,
      mapsUrl: p.googleMapsUri ?? null,
      rating: p.rating ?? null,
      totalRatings: p.userRatingCount ?? null,
    }));

    const placeIds = places.map((p) => p.placeId);
    const savedLeads = await this.prisma.lead.findMany({
      where: { placeId: { in: placeIds } },
      select: { placeId: true },
    });
    const savedSet = new Set(savedLeads.map((l) => l.placeId));

    return {
      results: places.map((p) => ({
        ...p,
        alreadySaved: savedSet.has(p.placeId),
      })),
      nextPageToken: data.nextPageToken ?? null,
    };
  }

  // ──────── Save Lead ────────
  @Post()
  @ApiOperation({ summary: "Save a place as a lead" })
  async saveLead(
    @Body()
    body: {
      placeId: string;
      name: string;
      address?: string;
      phone?: string;
      website?: string;
      mapsUrl?: string;
      rating?: number;
      totalRatings?: number;
      city?: string;
    },
  ) {
    if (!body.placeId || !body.name) {
      throw new HttpException(
        "placeId y name son requeridos",
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.prisma.lead.findUnique({
      where: { placeId: body.placeId },
    });
    if (existing) {
      throw new HttpException("Este negocio ya está guardado", HttpStatus.CONFLICT);
    }

    return this.prisma.lead.create({
      data: {
        placeId: body.placeId,
        name: body.name,
        address: body.address,
        phone: body.phone,
        website: body.website,
        mapsUrl: body.mapsUrl,
        rating: body.rating,
        totalRatings: body.totalRatings,
        city: body.city,
      },
    });
  }

  // ──────── List Leads ────────
  @Get()
  @ApiOperation({ summary: "List all saved leads" })
  async listLeads(
    @Query("status") status?: string,
    @Query("city") city?: string,
    @Query("q") q?: string,
  ) {
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ];
    }

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const counts = await this.prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return {
      leads,
      counts: counts.reduce(
        (acc, c) => {
          acc[c.status] = c._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      total: leads.length,
    };
  }

  // ──────── Update Lead ────────
  @Patch(":id")
  @ApiOperation({ summary: "Update lead status/notes" })
  async updateLead(
    @Param("id") id: string,
    @Body() body: { status?: string; notes?: string },
  ) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new HttpException("Lead no encontrado", HttpStatus.NOT_FOUND);
    }

    return this.prisma.lead.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status as any } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
    });
  }

  // ──────── Delete Lead ────────
  @Delete(":id")
  @ApiOperation({ summary: "Delete a lead" })
  async deleteLead(@Param("id") id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new HttpException("Lead no encontrado", HttpStatus.NOT_FOUND);
    }
    await this.prisma.lead.delete({ where: { id } });
    return { deleted: true };
  }
}
