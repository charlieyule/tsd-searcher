export class TSD {
  constructor(
    public readonly leftSeq: string,
    public readonly leftStart: number,
    public readonly leftEnd: number,
    public readonly rightSeq: string,
    public readonly rightStart: number,
    public readonly rightEnd: number,
    public readonly score: number,
  ) {
  }

  public contains(other: TSD): boolean {
    return this.leftStart <= other.leftStart && this.leftEnd >= other.leftEnd &&
      this.rightStart <= other.rightStart && this.rightEnd >= other.rightEnd;
  }

  public toString(): string {
    return `${this.leftSeq} (${this.leftStart}-${this.leftEnd}) ${this.rightSeq} (${this.rightStart}-${this.rightEnd})`;
  }
}
