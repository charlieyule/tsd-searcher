import { Buffer } from "std/streams/mod.ts";
import { searchFA, TSD } from "./mod.ts";
import { assertEquals } from "std/assert/mod.ts";

const faFileContent = `> sequence-1
AGTTTGAAGTACGATTAAAATTTTTCTTTTTCCGGATCCGAGTTTGATCTTC
TTTAGAAACAAAAATTATATTTGTTTAGAAAGTCTGTCAGTTGGGTTTTGGC
CCAATTGATTTACCTGGTAGTCAGAAATGTAAGTGACCTGACTACCCTTGAC
ATTAGTCAGAAAACATTCTAAACTCGAGATAAACACTGTGGTAGTTCTTTAG
AAAGAAGTCGACTCTAAAGTACTTTGGCGTAAAACAAAAAAATTTCCCTTGA
AATTATACTTTATTTGTTTGACATAAA
> sequence-2
AGTTTGAAGTACGATTAAAATTTTTCTTTTTCCGGATCCGAGTTTGATCTTC
TTTAGAAACAAAAATTATATTTGTTTAGAAAGTCTGTCAGTTGGGTTTTGGC
CCAATTGATTTACCTGGTAGTCAGAAATGTAAGTGACCTGACTACCCTTGAC
ATTAGTCAGAAAACATTCTAAACTCGAGATAAACACTGTGGTAGTTCTTTAG
AAAGAAGTCGACTCTAAAGTACTTTGGCGTAAAACAAAAAAATTTCCCTTGA
AATTATACTTTATTTGTTTGACATAAA
> sequence-3
AGTTTGAAGTACGATTAAAATTTTTCTTTTTCCGGATCCGAGTTTGATCTTC
TTTAGAAACAAAAATTATATTTGTTTAGAAAGTCTGTCAGTTGGGTTTTGGC
CCAATTGATTTACCTGGTAGTCAGAAATGTAAGTGACCTGACTACCCTTGAC
ATTAGTCAGAAAACATTCTAAACTCGAGATAAACACTGTGGTAGTTCTTTAG
AAAGAAGTCGACTCTAAAGTACTTTGGCGTAAAACAAAAAAATTTCCCTTGA
AATTATACTTTATTTGTTTGACATAAA
`;

const expected = [
  {
    seqId: "sequence-1",
    tsds: [
      new TSD("GTTTGAagTA", 1, 11, "GTTTGAcaTA", 275, 285, 6.4),
      new TSD("AAGTACgaTT", 6, 16, "AAGTAC--TT", 224, 232, 6.4),
      new TSD(
        "TTT-TTc-TTT",
        20,
        29,
        "TTTaTTtgTTT",
        268,
        279,
        5.818181818181818,
      ),
      new TSD(
        "TTTtcTTT-TT",
        21,
        31,
        "TTTa-TTTgTT",
        268,
        278,
        5.818181818181818,
      ),
    ],
  },
  {
    seqId: "sequence-2",
    tsds: [
      new TSD("GTTTGAagTA", 1, 11, "GTTTGAcaTA", 275, 285, 6.4),
      new TSD("AAGTACgaTT", 6, 16, "AAGTAC--TT", 224, 232, 6.4),
      new TSD(
        "TTT-TTc-TTT",
        20,
        29,
        "TTTaTTtgTTT",
        268,
        279,
        5.818181818181818,
      ),
      new TSD(
        "TTTtcTTT-TT",
        21,
        31,
        "TTTa-TTTgTT",
        268,
        278,
        5.818181818181818,
      ),
    ],
  },
  {
    seqId: "sequence-3",
    tsds: [
      new TSD("GTTTGAagTA", 1, 11, "GTTTGAcaTA", 275, 285, 6.4),
      new TSD("AAGTACgaTT", 6, 16, "AAGTAC--TT", 224, 232, 6.4),
      new TSD(
        "TTT-TTc-TTT",
        20,
        29,
        "TTTaTTtgTTT",
        268,
        279,
        5.818181818181818,
      ),
      new TSD(
        "TTTtcTTT-TT",
        21,
        31,
        "TTTa-TTTgTT",
        268,
        278,
        5.818181818181818,
      ),
    ],
  },
];

Deno.test("searchFA", async (t) => {
  await t.step("with RR scheduler", async () => {
    const readable =
      new Buffer(new TextEncoder().encode(faFileContent)).readable;
    const tsds: { seqId: string; tsds: TSD[] }[] = [];
    for await (
      const result of (await searchFA(readable, { scheduler: "rr" }))
    ) {
      tsds.push(result);
    }
    assertEquals(tsds, expected);
  });

  await t.step("with FI scheduler", async () => {
    const readable =
      new Buffer(new TextEncoder().encode(faFileContent)).readable;
    const tsds: { seqId: string; tsds: TSD[] }[] = [];
    for await (
      const result of (await searchFA(readable, { scheduler: "fi", size: 1 }))
    ) {
      tsds.push(result);
    }
    assertEquals(tsds, expected);
  });
});
