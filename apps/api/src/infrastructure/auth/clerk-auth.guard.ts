import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createClerkClient, verifyToken } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const ROLES_KEY = "roles";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing authorization token");
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const user = await clerk.users.getUser(payload.sub);
      request.auth = {
        userId: payload.sub,
        role: (user.publicMetadata as { role?: string })?.role ?? null,
      };
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    // Check required roles if any
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length) {
      const userRole = request.auth.role;
      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException("Insufficient permissions");
      }
    }

    return true;
  }
}
