# Leboncoin Messaging

Messaging interface built with Next.js 15, React 19, TypeScript and Tailwind CSS.
The application uses the Pages Router and a local json-server API for the technical test.

## Requirements

- Node.js 18 or newer.
- npm.

## Installation

```bash
npm ci
```

If `npm ci` is blocked on Windows because the Next.js SWC binary is locked, stop running
Node/Next processes and retry the command.

## Configuration

Copy `.env.example` to `.env.local` when a different API URL is needed:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
```

The application falls back to `http://localhost:3005` when the variable is not defined.

## Run locally

Start the API in one terminal:

```bash
npm run start-server
```

Start Next.js in another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The API contract is documented in [docs/api-swagger.yaml](docs/api-swagger.yaml). The
local server uses the documented paths and normalizes created fixture messages with the
conversation and author identifiers required by the read model.

## Available commands

```bash
npm test -- --runInBand  # Run the Jest and Testing Library suite
npm run lint             # Run Next.js ESLint checks
npm run build            # Create a production build, including lint checks
npm start                # Serve the production build
```

## Architecture and behavior

- `src/pages/index.tsx` coordinates the selected conversation and page layout.
- Components render the conversation list, messages, empty/error states and composer.
- Hooks own asynchronous loading, cancellation, retry and stale-request protection.
- Services own HTTP requests, status handling and runtime response validation.
- The UI uses a two-column desktop layout and a single-view mobile layout.
- Failed reads expose a retry action. Failed sends keep the draft text.
- Message timestamps from numeric fixtures are normalized at the service boundary.

## Testing strategy

Tests mock `fetch` at the service boundary and do not require a running API server.
They cover loading, empty and error states, conversation selection, message display,
message sending, duplicate-submit protection, retries, malformed responses and stale
requests.

## Known limitations

- The logged user is fixed to fixture user `1`, as provided by the technical-test setup.
- Conversation creation and deletion are outside the MVP.
- The local json-server is a development fixture and is not a production backend.
