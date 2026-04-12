export class Barber {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public readonly name: string,
    public readonly avatarUrl: string | null,
    public readonly isActive: boolean,
  ) {}
}
