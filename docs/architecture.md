# Wheel of Fortune MVP Architecture

## Goals

The MVP has three runtime boundaries:

1. **Dashboard Page** — site owners configure one campaign and inspect aggregate spin metrics.
2. **Site Widget** — visitors view and spin the active wheel through a Custom Element extension compatible with Wix Studio and Wix Editor. It never receives prize weights or inventory.
3. **Backend API** — validates all input, chooses winners, applies rate limits, and writes an append-only spin record.

The Wix extension manifest is composed in `src/extensions.ts`. Dashboard and widget bundles are independently built by the Wix Astro integration. Server routes live under `src/pages/api` and domain code under `src/backend`.

## Trust boundaries

- Dashboard mutations use the request's Wix identity and non-elevated Wix Data calls. Collection permissions are `PRIVILEGED`, so only an authorized site operator can change configuration.
- Visitor reads and spins are explicitly elevated only inside the backend after Wix visitor-token, campaign, payload, rate-limit, and idempotency checks.
- Prize selection happens on the server using `crypto.getRandomValues()`. The widget receives only the selected prize id after the result has been recorded.
- Raw IP addresses are never stored. A short-lived SHA-256 fingerprint is used only for abuse controls.
- Spin records are append-only through the application API. Campaign changes do not rewrite historical spin outcomes.

## Data model

### `WheelCampaigns`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | text | Internal dashboard name |
| `status` | text | `DRAFT`, `ACTIVE`, or `PAUSED` |
| `headline` | text | Visitor-facing copy |
| `buttonLabel` | text | Spin CTA |
| `primaryColor` | text | Validated hex color |
| `backgroundColor` | text | Validated hex color |
| `dailySpinLimit` | number | Per visitor fingerprint, 1–20 |
| `startsAt`, `endsAt` | datetime | Optional campaign window |

### `WheelPrizes`

| Field | Type | Notes |
| --- | --- | --- |
| `campaignId` | text | Indexed campaign reference |
| `label` | text | Public wheel label |
| `couponCode` | text (encrypted) | Revealed only for a winning spin |
| `color` | text | Segment color |
| `weight` | number | Server-only relative probability |
| `position` | number | Stable visual ordering |
| `enabled` | boolean | Excludes a prize without deleting history |

### `WheelSpins`

| Field | Type | Notes |
| --- | --- | --- |
| `campaignId`, `prizeId` | text | Indexed audit dimensions |
| `idempotencyKey` | text | Unique replay protection key |
| `visitorHash` | text | Salted request fingerprint, never a raw IP |
| `outcomeLabel` | text | Immutable historical label snapshot |
| `couponCode` | text (encrypted) | Historical fulfillment snapshot |
| `spunAt` | datetime | Server timestamp |

All collections use `PRIVILEGED` permissions. Public access is possible only through the narrow backend DTOs.

## API surface

- `GET /api/campaigns/current` — sanitized active campaign DTO; no weights or coupon codes.
- `GET /api/dashboard` — privileged configuration and metrics.
- `PUT /api/dashboard` — privileged, schema-validated campaign replacement.
- `POST /api/spins` — public spin command with a required idempotency key.

JSON responses include `Cache-Control: no-store`, a request id, and a stable error envelope. Dashboard mutations require JSON and same-origin browser requests. Site-widget spins use Wix's authenticated HTTP client and the backend requires a valid Wix visitor token before performing elevated data access.

## MVP constraints and next hardening step

The included rate limiter is process-local, suitable as a first abuse-control layer but not a global quota. Before broad production rollout, move counters and idempotency reservations to a strongly consistent shared store and make prize inventory claims transactional.
