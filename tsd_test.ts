import { assertEquals } from "std/assert/mod.ts";
import { TSD } from "./tsd.ts";

Deno.test("TSD.toString", () => {
  const tsd = new TSD(
    "aaccggtt",
    1,
    9,
    "aa-cg-tt",
    11,
    17,
    0.75,
  );
  assertEquals(tsd.toString(), "aaccggtt (1-9) aa-cg-tt (11-17)");
});
