import { assert, assertEquals, assertFalse } from "std/assert/mod.ts";
import { TSD } from "./tsd.ts";

Deno.test("TSD.contains", async (t) => {
  const tsd = new TSD(
    "aaccggtt",
    1,
    9,
    "aa-cg-tt",
    11,
    17,
    4.5,
  );
  await t.step("return true #1", () => {
    const other = new TSD(
      "aaccggtt",
      1,
      9,
      "aa-cg-tt",
      11,
      17,
      4.5,
    );
    assert(tsd.contains(other));
  });
  await t.step("return true #2", () => {
    const other = new TSD(
      "accggt",
      2,
      8,
      "a-c--gt",
      12,
      16,
      4.5,
    );
    assert(tsd.contains(other));
  });
  await t.step("return false", () => {
    const other = new TSD(
      "accggttg",
      2,
      10,
      "a-c--gttg",
      12,
      18,
      4.5,
    );
    assertFalse(tsd.contains(other));
  });
});

Deno.test("TSD.toString", () => {
  const tsd = new TSD(
    "aaccggtt",
    1,
    9,
    "aa-cg-tt",
    11,
    17,
    4.5,
  );
  assertEquals(tsd.toString(), "aaccggtt (2-9) aa-cg-tt (12-17)");
});
