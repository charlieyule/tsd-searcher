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

  public toString(): string {
    return `${this.leftSeq} (${this.leftStart}-${this.leftEnd}) ${this.rightSeq} (${this.rightStart}-${this.rightEnd})`;
  }
}
