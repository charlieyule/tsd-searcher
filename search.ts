import { TSD } from "./tsd.ts";

export class Candidate {
  private static TSD_PADDING = "-";

  constructor(
    private leftR1: string,
    private leftS1: string,
    private leftR2: string,
    private leftS2: string,
    private leftR3: string,
    private rightR1: string,
    private rightS1: string,
    private rightR2: string,
    private rightS2: string,
    private rightR3: string,
    private localLeftStart: number,
    private localLeftEnd: number,
    private localRightStart: number,
    private localRightEnd: number,
  ) {
  }

  public isQualified(matchThr: number, mismatchThr: number): boolean {
    return this.leftR1.length + this.leftR2.length + this.leftR3.length >=
        matchThr &&
      Math.max(this.leftS1.length, this.rightS1.length) +
            Math.max(this.leftS2.length, this.rightS2.length) <= mismatchThr;
  }

  public toTSD(leftOffset: number, rightOffset: number): TSD {
    let leftSeq = this.leftR1.toUpperCase();
    let rightSeq = this.rightR1.toUpperCase();
    leftSeq += this.leftS1.toLowerCase();
    rightSeq += this.rightS1.toLowerCase();
    [leftSeq, rightSeq] = Candidate.align_padding(leftSeq, rightSeq);
    leftSeq += this.leftR2.toUpperCase();
    rightSeq += this.rightR2.toUpperCase();
    leftSeq += this.leftS2.toLowerCase();
    rightSeq += this.rightS2.toLowerCase();
    [leftSeq, rightSeq] = Candidate.align_padding(leftSeq, rightSeq);
    leftSeq += this.leftR3.toUpperCase();
    rightSeq += this.rightR3.toUpperCase();
    return new TSD(
      leftSeq,
      this.localLeftStart + leftOffset,
      this.localLeftEnd + leftOffset,
      rightSeq,
      this.localRightStart + rightOffset,
      this.localRightEnd + rightOffset,
      (this.leftR1.length + this.leftR2.length + this.leftR3.length) /
        leftSeq.length,
    );
  }

  private static align_padding(
    leftSeq: string,
    rightSeq: string,
  ): [string, string] {
    if (leftSeq.length > rightSeq.length) {
      return [
        leftSeq,
        rightSeq + this.TSD_PADDING.repeat(leftSeq.length - rightSeq.length),
      ];
    }
    if (leftSeq.length < rightSeq.length) {
      return [
        leftSeq + this.TSD_PADDING.repeat(rightSeq.length - leftSeq.length),
        rightSeq,
      ];
    }
    return [leftSeq, rightSeq];
  }
}
