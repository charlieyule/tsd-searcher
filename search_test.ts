import { assert, assertEquals, assertFalse } from "std/assert/mod.ts";
import { Candidate, search } from "./search.ts";
import { TSD } from "./tsd.ts";

Deno.test("search", () => {
  const seq = "AGTTTGAAGTACGATTAAAATTTTTCTTTTTCCGGATCCGAGTTTGATCTTC" +
    "TTTAGAAACAAAAATTATATTTGTTTAGAAAGTCTGTCAGTTGGGTTTTGGC" +
    "CCAATTGATTTACCTGGTAGTCAGAAATGTAAGTGACCTGACTACCCTTGAC" +
    "ATTAGTCAGAAAACATTCTAAACTCGAGATAAACACTGTGGTAGTTCTTTAG" +
    "AAAGAAGTCGACTCTAAAGTACTTTGGCGTAAAACAAAAAAATTTCCCTTGA" +
    "AATTATACTTTATTTGTTTGACATAAA";

  const tsds = search(seq);
  assertEquals(tsds, [
    new TSD("GTTTGAagTA", 1, 11, "GTTTGAcaTA", 275, 285, 6.4),
    new TSD("AAGTACgaTT", 6, 16, "AAGTAC--TT", 224, 232, 6.4),
    new TSD("TTT-TTc-TTT", 20, 29, "TTTaTTtgTTT", 268, 279, 5.818181818181818),
    new TSD("TTTtcTTT-TT", 21, 31, "TTTa-TTTgTT", 268, 278, 5.818181818181818),
  ]);
});

Deno.test("Candidate.isQualified", async (t) => {
  const candidate = new Candidate(
    "aa",
    "c",
    "cg",
    "g",
    "tt",
    "aa",
    "",
    "cg",
    "",
    "tt",
    1,
    9,
    11,
    17,
  );
  await t.step("true", () => {
    assert(candidate.isQualified(5, 2));
  });
  await t.step("false #1", () => {
    assertFalse(candidate.isQualified(7, 2));
  });
  await t.step("false #2", () => {
    assertFalse(candidate.isQualified(2, 1));
  });
});

Deno.test("Candidate.toTSD", () => {
  const candidate = new Candidate(
    "aa",
    "c",
    "cg",
    "g",
    "tt",
    "aa",
    "",
    "cg",
    "",
    "tt",
    1,
    9,
    11,
    17,
  );
  assertEquals(
    candidate.toTSD(1, 2),
    new TSD(
      "AAcCGgTT",
      2,
      10,
      "AA-CG-TT",
      13,
      19,
      4.5,
    ),
  );
});
