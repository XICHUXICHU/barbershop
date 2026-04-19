export class Service {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly durationMinutes: number,
    public readonly priceAmount: number, // whole currency units
    public readonly priceCurrency: string,
    public readonly isActive: boolean,
  ) {}

  get priceFormatted(): string {
    return `$${this.priceAmount} ${this.priceCurrency}`;
  }
}
