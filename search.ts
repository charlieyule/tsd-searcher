import { sprintf } from "std/fmt/printf.ts";
import { defaultOptions, SearchOptions } from "./options.ts";
import { TSD } from "./tsd.ts";

const BASES = String.raw`[ACGT]`;
const PADDING_LENGTH = 6;
const PADDING_CHAR = "#";
const PADDING = PADDING_CHAR.repeat(PADDING_LENGTH);

export function search(
  seq: string,
  options?: SearchOptions,
): TSD[] {
  const mergedOptions = { ...defaultOptions, ...options };
  const tsds: TSD[] = [];

  const leftLeft = mergedOptions.leftOffset;
  const leftRight = leftLeft + mergedOptions.leftRange;
  const rightRight = seq.length - mergedOptions.rightOffset;
  const rightLeft = rightRight - mergedOptions.rightRange;

  const searchSeq = seq.substring(leftLeft, leftRight) + PADDING +
    seq.substring(rightLeft, rightRight);

  const spacer = sprintf(String.raw`${BASES}{0,${mergedOptions.sLen}}?`);
  const leftRepeatsPattern = sprintf(
    String.raw`(%[1]v{%[3]v,})` +
      String.raw`(%[2]v)` +
      String.raw`(%[1]v{%[4]v,})` +
      String.raw`(%[2]v)` +
      String.raw`(%[1]v{%[5]v,})`,
    BASES,
    spacer,
    mergedOptions.r1Len,
    mergedOptions.r2Len,
    mergedOptions.r3Len,
  );
  const rightRepeatsPattern = sprintf(
    String.raw`(\2)(%[1]v)(\4)(%[1]v)(\6)`,
    spacer,
  );
  const spacerBetweenRepeats = sprintf(String.raw`${PADDING}`);

  for (
    let pos1 = 0;
    pos1 <
      mergedOptions.leftRange - mergedOptions.leftOffset -
        mergedOptions.matchThr;
    pos1++
  ) {
    let pos2 = 0;
    const leftHeadPattern = String.raw`^(${BASES}{${pos1}})`;
    const leftTailPattern = String.raw`${BASES}*`;
    let rightHeadPattern = String.raw`(${BASES}{${pos2},})`;
    const rightTailPattern = String.raw`${BASES}*$`;
    let re = new RegExp(
      leftHeadPattern + leftRepeatsPattern + leftTailPattern +
        spacerBetweenRepeats +
        rightHeadPattern + rightRepeatsPattern + rightTailPattern,
      "i",
    );
    let match = re.exec(searchSeq);
    while (match) {
      const [
        ,
        leftHead,
        leftR1,
        leftS1,
        leftR2,
        leftS2,
        leftR3,
        rightHead,
        rightR1,
        rightS1,
        rightR2,
        rightS2,
        rightR3,
      ] = match;
      const rLength = leftR1.length + leftR2.length + leftR3.length;
      const localLeftStart = match.index + leftHead.length;
      const localLeftEnd = localLeftStart + rLength + leftS1.length +
        leftS2.length;
      const localRightStart = rightHead.length;
      const localRightEnd = rightHead.length + rLength + rightS1.length +
        rightS2.length;
      const candidate = new Candidate(
        leftR1,
        leftS1,
        leftR2,
        leftS2,
        leftR3,
        rightR1,
        rightS1,
        rightR2,
        rightS2,
        rightR3,
        localLeftStart,
        localLeftEnd,
        localRightStart,
        localRightEnd,
      );
      if (
        !candidate.isQualified(
          mergedOptions.matchThr,
          mergedOptions.mismatchThr,
        )
      ) {
        break;
      }
      const tsd = candidate.toTSD(leftLeft, rightLeft);
      if (!tsds.find((other) => other.contains(tsd))) {
        tsds.push(tsd);
      }
      pos2++;
      rightHeadPattern = String.raw`(${BASES}{${pos2},})`;
      re = new RegExp(
        leftHeadPattern + leftRepeatsPattern + leftTailPattern +
          spacerBetweenRepeats +
          rightHeadPattern + rightRepeatsPattern + rightTailPattern,
        "i",
      );
      match = re.exec(searchSeq);
    }
  }

  return tsds;
}

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
      (this.leftR1.length + this.leftR2.length + this.leftR3.length) ** 2 /
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
