export class Barbershop {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly phone: string,
    public readonly address: string,
    public readonly logoUrl: string | null,
    public readonly coverUrl: string | null,
    public readonly servicesPosterUrl: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}
}
