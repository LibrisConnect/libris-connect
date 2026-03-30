## LibrisConnect Client

Frontend for LibrisConnect using Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.

## API Contract Lock (Pre-Backend)

Before backend implementation, contracts are locked here:

- [`docs/API_CONTRACTS.md`](./docs/API_CONTRACTS.md)
- [`types/api-contracts.ts`](./types/api-contracts.ts)

`types/book.ts` is the source of truth for all `Book` fields. Backend responses must match exactly.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open `http://localhost:3000`.

## Service Layer Rule

UI should call services only:

- `getBooks`
- `getBookById`
- `searchBooks`

Backend integration should replace service internals, not UI consumers.
