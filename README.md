# treasury-subgraph-fetch

This is a quick-n-dirty client in Typescript to fetch prices and metrics. It processes the results and writes them to the disk in a format that will be understood by the Olympus RBS v2 activation scripts.

## Scripts

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

To generate the client for the DefiLlama API:

```bash
bun run codegen
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
