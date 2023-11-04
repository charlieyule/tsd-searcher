# TSD Searcher

A Tandem Site Duplication (TSD) Searcher, written in TypeScript and built on
Deno.

This is a re-implementation of
[AnnoSINE](https://github.com/yangli557/AnnoSINE)'s
[TSD_Searcher](https://github.com/yangli557/AnnoSINE/blob/26301e9bc61400aa461ad58fb3a254e4e33c7af4/bin/TSD_Searcher.js),
aiming to extract the non-Python dependency from AnnoSINE and make it easier to
integrate.

TSD Searcher takes advantage of multicore parallel processing by spawning
multiple workers to accelerate the search. By default, the number of workers is
half the number of CPU cores.

## Installation

### Download Pre-Build Binaries

Pre-build binaries are available on the
[GitHub release page](https://github.com/charlieyule/tsd-searcher/releases).

### Build From Source

It requires [**Deno**](https://deno.com/) to build TSD Searcher source to a
binary.

Execute the following command in the root of source.

```sh
deno task build
```

A binary will be built under the `build` directory.

## Usage

```
Usage: tsd-searcher <fasta_file> [options]

Arguments:
  fasta_file    Filepath to an FASTA format file

Options:
  -h, --help
      Print help
  -o, --output
      Output file name (default: ./out.txt)
  -w, --workers
      Number of workers to search TSD concurrently (default: number of CPU cores / 2)
  --worker-scheduler
      Worker scheduler "rr" (Round-robin) or "fi" (First-idle) (default: "fi")
  --lo, --left-offset
      Offset from 5' end (default: 0)
  --lr, --left-range
      Search range after the offset from 5' end (default: 40)
  --ro, --right-offset
      Offset from 3' end (default: 0)
  --rr, --right-range
      Search range after the offset from 3' end (default: 70)
  --r1, --r1-length
      1st sub-repeat min length (default: 2)
  --r2, --r2-length
      2nd sub-repeat min length (default: 2)
  --r3, --r2-length
      3rd sub-repeat min length (default: 2)
  --spc, --spc-length
      Max length of spacers between sub-repeats (default: 2)
  --mt, --match-thr
      Min length of total match (default: 8)
  --mmt, --mismatch-thr
      Max length of total mismatch (default: 3)
```
