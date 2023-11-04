export const defaultOptions = {
  leftOffset: 0,
  leftRange: 40,
  rightOffset: 0,
  rightRange: 70,
  r1Len: 2,
  r2Len: 2,
  r3Len: 2,
  sLen: 2,
  matchThr: 8,
  mismatchThr: 3,
};

export interface SearchOptions {
  leftOffset?: number;
  leftRange?: number;
  rightOffset?: number;
  rightRange?: number;
  r1Len?: number;
  r2Len?: number;
  r3Len?: number;
  sLen?: number;
  matchThr?: number;
  mismatchThr?: number;
}

export type WorkerPoolOptions = {
  size?: number;
  scheduler?: "rr" | "fi";
};
