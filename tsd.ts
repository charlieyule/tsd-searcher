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

  // Return a string representation of a TSD result where "start" and "end" are one-based
  // indices respectively pointing to the first and last bases of a TSD.
  public toString(): string {
    return `${this.leftSeq} (${
      this.leftStart + 1
    }-${this.leftEnd}) ${this.rightSeq} (${
      this.rightStart + 1
    }-${this.rightEnd})`;
  }
}
