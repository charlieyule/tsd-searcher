import { Buffer } from "std/streams/mod.ts";
import { readFA } from "./file_handler.ts";
import { assertEquals } from "std/assert/assert_equals.ts";

Deno.test("readFA", async () => {
  const faContent = `>CP002687.1 + 728326:728533
AGTTTGAAGTACGA
TTAAAATTTTTCTT
TTTCCGGATCCG
>CP002687.1 + 2670149:2670248
TTATTTGACAAAAT
CTTGCAAGGAATTT
TGAAACAGTGTGGT
AG
`;
  const readable = new Buffer(new TextEncoder().encode(faContent)).readable;
  const entries = [];
  for await (const entry of await readFA(readable)) {
    entries.push(entry);
  }
  assertEquals(entries, [
    {
      id: "CP002687.1 + 728326:728533",
      seq: "AGTTTGAAGTACGATTAAAATTTTTCTTTTTCCGGATCCG",
    },
    {
      id: "CP002687.1 + 2670149:2670248",
      seq: "TTATTTGACAAAATCTTGCAAGGAATTTTGAAACAGTGTGGTAG",
    },
  ]);
});
