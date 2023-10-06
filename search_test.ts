import { assert, assertEquals, assertFalse } from "std/assert/mod.ts";
import { Candidate } from "./search.ts";
import { TSD } from "./tsd.ts";

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
      0.75,
    ),
  );
});
