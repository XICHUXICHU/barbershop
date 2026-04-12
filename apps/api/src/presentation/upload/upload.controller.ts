import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow("CLOUDINARY_CLOUD_NAME"),
      api_key: this.config.getOrThrow("CLOUDINARY_API_KEY"),
      api_secret: this.config.getOrThrow("CLOUDINARY_API_SECRET"),
    });
  }

  @Post("image")
  @ApiOperation({ summary: "Upload an image to Cloudinary" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_FILE_SIZE } }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException("No se envió ningún archivo");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "Formato no permitido. Usa JPG, PNG, WebP o AVIF",
      );
    }

    const result = await this.uploadToCloudinary(file.buffer);
    return { url: result.secure_url };
  }

  private uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "barbershop",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve(result);
        },
      );
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });
  }
}
