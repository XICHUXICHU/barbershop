export class Customer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly email: string | null,
  ) {}
}
