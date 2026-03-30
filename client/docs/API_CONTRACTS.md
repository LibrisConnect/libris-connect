# LibrisConnect API Contracts

These contracts are locked before backend implementation.  
Frontend and backend must match these shapes exactly.

## Source Of Truth

- Book model: [`types/book.ts`](../types/book.ts)
- Request model: [`types/request.ts`](../types/request.ts)
- API contracts: [`types/api-contracts.ts`](../types/api-contracts.ts)

## Endpoints

### `GET /api/books/search?q=&college=&availability=`

Query params:

- `q?: string`
- `college?: string`
- `availability?: "available" | "issued" | "digital" | "all"`

Success `200`:

```json
{
  "items": [
    {
      "id": "book-1",
      "title": "Introduction to Algorithms",
      "author": "Thomas H. Cormen",
      "isbn": "9780262046305",
      "college": "IIT Madras",
      "availability": "available"
    }
  ],
  "total": 1
}
```

Errors:

- `400 BAD_REQUEST` invalid query parameters
- `500 INTERNAL_ERROR` unexpected failure

### `GET /api/books/:id`

Path params:

- `id: string`

Success `200`:

```json
{
  "id": "book-1",
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "isbn": "9780262046305",
  "college": "IIT Madras",
  "availability": "available"
}
```

Errors:

- `400 BAD_REQUEST` invalid id format
- `404 NOT_FOUND` book does not exist
- `500 INTERNAL_ERROR` unexpected failure

### `POST /api/requests`

Request body:

```json
{
  "bookId": "book-1"
}
```

Success `201`:

```json
{
  "request": {
    "id": "REQ-1030",
    "bookId": "book-1",
    "title": "Introduction to Algorithms",
    "targetCollege": "IIT Madras",
    "state": "pending_approval",
    "createdAt": "2026-03-31T12:00:00.000Z"
  }
}
```

Errors:

- `400 BAD_REQUEST` missing/invalid body
- `401 UNAUTHORIZED` user not logged in
- `404 NOT_FOUND` book does not exist
- `409 CONFLICT` duplicate active request
- `500 INTERNAL_ERROR` unexpected failure

### `GET /api/requests/me`

Success `200`:

```json
{
  "requests": [
    {
      "id": "REQ-1030",
      "bookId": "book-1",
      "title": "Introduction to Algorithms",
      "targetCollege": "IIT Madras",
      "state": "pending_approval",
      "createdAt": "2026-03-31T12:00:00.000Z"
    }
  ]
}
```

Errors:

- `401 UNAUTHORIZED` user not logged in
- `500 INTERNAL_ERROR` unexpected failure

## Error Envelope

All non-2xx responses must follow:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Human-readable message",
    "details": "Optional extra context"
  }
}
```
