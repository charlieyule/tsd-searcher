export class TSD {
  constructor(
    private leftSeq: string,
    private leftStart: number,
    private leftEnd: number,
    private rightSeq: string,
    private rightStart: number,
    private rightEnd: number,
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
