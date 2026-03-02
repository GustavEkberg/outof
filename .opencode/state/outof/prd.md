# PRD: Outof - Telegram Shopping List Service

**Date:** 2026-02-02

---

## Problem Statement

### What problem are we solving?

Households need a frictionless way to track items they've run out of and generate shareable shopping lists. Existing solutions require dedicated apps, account creation, or complex setup. Telegram provides an always-open communication channel that households already use.

### Why now?

Rewriting the existing Rust implementation to leverage modern serverless infrastructure (Vercel + Turso) for zero-ops maintenance and lower hosting costs.

### Who is affected?

- **Primary users:** Household members sharing a Telegram group who need to track groceries/supplies
- **Secondary users:** Individuals using the bot in private chat for personal lists

---

## Proposed Solution

### Overview

A minimal Next.js application that receives Telegram webhook updates, processes three commands (`/outof`, `/list`, `/generate`), stores items in Turso (SQLite), and serves simple HTML pages for shopping list interaction.

### User Experience

#### User Flow: Adding Items

1. User sends `/outof milk, eggs, bread` in Telegram chat
2. Bot responds: "Added items milk, eggs, bread"
3. Items are stored associated with the chat_id

#### User Flow: Viewing Items

1. User sends `/list`
2. Bot responds with all current items and who added them

#### User Flow: Shopping

1. User sends `/generate`
2. Bot responds with a link: "[Brave Alpaca](https://outof.im/{chat_id}/list/{list_name})"
3. User opens link, sees items with "X" (skip) and "checkmark" (bought) buttons
4. Marking "bought" removes item from master list AND current shopping list
5. Marking "skip" removes item only from current shopping list (still needed, just not buying now)
6. When all items handled, list page shows empty/completed state

---

## End State

When this PRD is complete, the following will be true:

- [ ] Telegram bot responds to `/outof`, `/list`, `/generate` commands
- [ ] Items persist in Turso database scoped by chat_id
- [ ] Shopping lists are generated with random adjective+animal names
- [ ] Web UI allows marking items as bought/skipped
- [ ] Webhook receives updates from Telegram securely (secret token verification)
- [ ] Deployable to Vercel with zero additional infrastructure
- [ ] Effect-TS service architecture for Telegram and DB interactions

---

## Success Metrics

### Quantitative

| Metric                | Current | Target | Measurement Method       |
| --------------------- | ------- | ------ | ------------------------ |
| Cold start latency    | N/A     | <500ms | Vercel analytics         |
| Webhook response time | N/A     | <200ms | Telegram doesn't timeout |

### Qualitative

- Bot feels instant and responsive
- Shopping list UI works well on mobile

---

## Acceptance Criteria

### Telegram Bot

- [ ] `POST /api/telegram/webhook` receives Telegram updates
- [ ] Webhook validates `X-Telegram-Bot-Api-Secret-Token` header
- [ ] `/outof item1, item2` parses comma-separated items and stores them
- [ ] `/list` returns formatted list of all items with user and timestamp
- [ ] `/generate` creates a new shopping list and returns clickable link
- [ ] Bot ignores non-command messages gracefully

### Database (Turso)

- [ ] `item` table: id, chat_id, title, user_name, created_at
- [ ] `shopping_list` table: id, chat_id, name, created_at
- [ ] `shopping_list_item` table: shopping_list_id, item_id (copy of items at generation time)
- [ ] Items scoped by chat_id (group or private chat)

### Web UI

- [ ] `GET /{chat_id}/list/{list_name}` renders shopping list page
- [ ] Each item shows title with skip (X) and bought (checkmark) buttons
- [ ] Skip action: removes from current list only
- [ ] Bought action: removes from current list AND master item list
- [ ] Empty list shows completion message
- [ ] Mobile-friendly (large tap targets, responsive)
- [ ] Minimal styling (dark theme like original)

### Infrastructure

- [ ] Deploys to Vercel
- [ ] Turso database connection via libsql
- [ ] Environment variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- [ ] Script to register/verify/delete webhook with Telegram

### Webhook Setup

Telegram bots receive updates via webhook (HTTPS POST to our endpoint). A setup script must handle registration, verification, and teardown.

#### Telegram API Methods Used

| Method           | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `setWebhook`     | Register webhook URL + secret token       |
| `getWebhookInfo` | Verify current webhook config and status  |
| `deleteWebhook`  | Remove webhook (for switching to polling) |

#### setWebhook Parameters

| Parameter              | Required | Description                                                            |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| `url`                  | Yes      | HTTPS URL (`https://outof.im/api/telegram/webhook`)                    |
| `secret_token`         | No       | 1-256 chars (`A-Za-z0-9_-`), sent as `X-Telegram-Bot-Api-Secret-Token` |
| `allowed_updates`      | No       | Filter update types (default: all except `chat_member`)                |
| `max_connections`      | No       | 1-100, default 40                                                      |
| `drop_pending_updates` | No       | Drop queued updates on registration                                    |

> Supported webhook ports: **443, 80, 88, 8443**

#### Script Requirements (`scripts/setup-webhook.sh`)

- [ ] Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` from `.env.local`
- [ ] Supports subcommands: `set`, `info`, `delete`
- [ ] `set` calls `setWebhook` with URL + secret_token, prints response
- [ ] `info` calls `getWebhookInfo`, prints URL, pending count, last error
- [ ] `delete` calls `deleteWebhook`, prints confirmation
- [ ] Validates env vars present before calling API
- [ ] Exposed as `pnpm webhook:set`, `pnpm webhook:info`, `pnpm webhook:delete`

#### getWebhookInfo Response (for troubleshooting)

Key fields: `url`, `pending_update_count`, `last_error_date`, `last_error_message`. If `url` is empty, no webhook is set. Non-zero `pending_update_count` or presence of `last_error_message` indicates delivery issues.

---

## Tasks

### Project Setup [setup]

Clean scaffold with Next.js, Effect-TS, Drizzle, and Turso dependencies.

**Verification:**

- Remove existing boilerplate files not needed for outof
- package.json has dependencies: next, effect, drizzle-orm, @libsql/client
- tsconfig.json configured with strict mode and path aliases
- .env.example documents all required env vars
- pnpm install succeeds
- pnpm tsc passes

### Database Schema [db]

Drizzle schema for items, shopping lists, and shopping list items.

**Verification:**

- lib/services/db/schema.ts defines item table (id, chatId, title, userName, createdAt)
- lib/services/db/schema.ts defines shoppingList table (id, chatId, name, createdAt)
- lib/services/db/schema.ts defines shoppingListItem table (id, shoppingListId, itemId, title, userName)
- drizzle.config.ts configured for Turso
- pnpm db:push creates tables in Turso (manual verification)

### Db Service [service]

Effect-TS service for Turso database connection.

**Verification:**

- lib/services/db/live-layer.ts exports Db service
- Service provides Drizzle client configured for Turso
- Config uses TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
- lib/layers.ts exports AppLayer with Db.Live

### Telegram Service [service]

Effect-TS service for sending Telegram messages.

**Verification:**

- lib/services/telegram/live-layer.ts exports Telegram service
- Service has sendMessage(chatId, text, parseMode?) method
- Config uses TELEGRAM_BOT_TOKEN
- lib/layers.ts includes Telegram.Live in AppLayer

### Item Domain Logic [domain]

Core functions for managing items.

**Verification:**

- lib/core/item/queries.ts has getItemsByChatId(chatId)
- lib/core/item/queries.ts has createItems(chatId, items[], userName)
- lib/core/item/queries.ts has deleteItem(itemId)
- All functions return Effect with proper error types

### Shopping List Domain Logic [domain]

Core functions for managing shopping lists.

**Verification:**

- lib/core/list/queries.ts has createShoppingList(chatId, name, items[])
- lib/core/list/queries.ts has getShoppingList(chatId, name)
- lib/core/list/queries.ts has removeFromShoppingList(shoppingListId, itemId)
- lib/core/list/name-generator.ts generates random "Adjective Animal" names

### Webhook Handler [api]

API route to receive Telegram updates.

**Verification:**

- app/api/telegram/webhook/route.ts handles POST
- Validates X-Telegram-Bot-Api-Secret-Token header
- Returns 401 if secret invalid
- Returns 200 for valid requests
- Parses Telegram Update object

### /outof Command [bot]

Handle /outof command to add items.

**Verification:**

- Parses "/outof milk, eggs, bread" into ["milk", "eggs", "bread"]
- Stores items with chatId, userName, timestamp
- Responds "Added items milk, eggs, bread"
- Handles empty input gracefully

### /list Command [bot]

Handle /list command to show items.

**Verification:**

- Retrieves all items for chatId
- Formats as "item (user) MM-DD HH:MM" per line
- Responds with formatted list
- Shows "No items" if empty

### /generate Command [bot]

Handle /generate command to create shopping list.

**Verification:**

- Generates random list name (Adjective Animal)
- Creates shopping list with snapshot of current items
- Responds with markdown link "[Name](https://outof.im/{chatId}/list/{name})"
- Shows "No items to generate list" if empty

### Shopping List Page [ui]

Web page to display and interact with shopping list.

**Verification:**

- app/[chatId]/list/[name]/page.tsx renders list
- Shows list name as heading
- Each item has skip (X) and bought (checkmark) buttons
- Dark theme, mobile-friendly styling
- Shows "List complete" when empty

### Item Actions [ui]

Handle bought/skip actions on shopping list items.

**Verification:**

- GET /{chatId}/list/{name}/item/{id}?action=bought removes from both lists
- GET /{chatId}/list/{name}/item/{id}?action=skip removes from shopping list only
- Redirects back to list page after action
- Invalid action returns 400

### Documentation [docs]

README and setup instructions.

**Verification:**

- README.md explains what outof does
- Documents environment variables
- Documents webhook setup via `pnpm webhook:set` / `pnpm webhook:info` / `pnpm webhook:delete`
- scripts/setup-webhook.sh exists and is executable
- AGENTS.md updated for new project structure

---

## Technical Context

### Existing Patterns (from reference_repo)

- `lib/services/*/live-layer.ts` - Effect-TS service pattern
- `lib/layers.ts` - AppLayer composition
- `app/api/*/route.ts` - API route handlers

### New Services Required

- `Telegram` service - send messages via Bot API
- `Db` service - Turso/libsql connection with Drizzle ORM

### Key Dependencies

- `@libsql/client` - Turso client
- `drizzle-orm` + `drizzle-kit` - ORM and migrations
- `effect` - Effect-TS runtime
- `next` - Framework

### Data Model

```sql
-- Items the household is "out of"
CREATE TABLE item (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  title TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  INDEX idx_item_chat_id (chat_id)
);

-- Generated shopping lists
CREATE TABLE shopping_list (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  INDEX idx_shopping_list_chat_id (chat_id)
);

-- Items in a specific shopping list (snapshot at generation)
CREATE TABLE shopping_list_item (
  id TEXT PRIMARY KEY,
  shopping_list_id TEXT NOT NULL REFERENCES shopping_list(id),
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  user_name TEXT NOT NULL,
  UNIQUE(shopping_list_id, item_id)
);
```

---

## Risks & Mitigations

| Risk                          | Likelihood | Impact | Mitigation                                   |
| ----------------------------- | ---------- | ------ | -------------------------------------------- |
| Telegram webhook timeout      | Low        | Med    | Keep handler fast, do DB ops async if needed |
| Turso cold start              | Med        | Low    | Turso is designed for edge, should be fast   |
| Concurrent list modifications | Low        | Low    | Last-write-wins acceptable for grocery lists |
| Webhook secret leaked         | Low        | High   | Use Vercel env vars, rotate if compromised   |

---

## Alternatives Considered

### Alternative 1: Polling instead of Webhooks

- **Pros:** Simpler setup, works anywhere
- **Cons:** Requires always-on process, not serverless-friendly, higher latency
- **Decision:** Rejected. Webhooks work with Vercel and are more efficient.

### Alternative 2: Vercel Postgres instead of Turso

- **Pros:** Vercel-native, good integration
- **Cons:** Heavier than needed, more expensive for simple use case
- **Decision:** Rejected. Turso is lighter weight and SQLite-compatible.

### Alternative 3: File-based storage (like original)

- **Pros:** Zero external dependencies
- **Cons:** Doesn't work on serverless (ephemeral filesystem)
- **Decision:** Rejected. Vercel functions have no persistent filesystem.

---

## Non-Goals (v1)

- **User authentication** - Chat-scoped by Telegram chat_id is sufficient
- **Multiple lists per chat** - One master list, generate shopping lists from it
- **Item categories/sorting** - Keep it simple, just a flat list
- **Recurring items** - No auto-replenishment, users re-add manually
- **Rich web dashboard** - Minimal HTML pages only
- **Telegram inline mode** - Commands only for v1

---

## Interface Specifications

### Telegram Commands

```
/outof item1, item2, ...
  - Adds comma-separated items to master list
  - Response: "Added items item1, item2, ..."

/list
  - Shows all items in master list
  - Response: "item1 (User) 01-15 14:30\nitem2 (User) 01-15 14:35"

/generate
  - Creates shopping list from current items
  - Response: "[Adjective Animal](https://outof.im/{chat_id}/list/{name})"
```

### API Routes

```
POST /api/telegram/webhook
  Headers: X-Telegram-Bot-Api-Secret-Token: <secret>
  Body: Telegram Update object
  Response: 200 OK (Telegram ignores response body)

GET /[chat_id]/list/[name]
  Response: HTML page with shopping list UI

GET /[chat_id]/list/[name]/item/[id]?action=bought|skip
  Response: Redirect back to list page
```

---

## Documentation Requirements

- [ ] README with setup instructions
- [ ] Environment variable documentation
- [ ] Webhook registration script/command

---

## Open Questions

| Question                              | Owner | Due Date      | Status   | Resolution                     |
| ------------------------------------- | ----- | ------------- | -------- | ------------------------------ |
| Domain name for deployment?           | User  | Before deploy | Resolved | `outof.im`                     |
| Existing Telegram bot token to reuse? | User  | Before deploy | Resolved | Reuse existing `@iamoutof_bot` |
| URL structure for list pages?         | User  | Before deploy | Resolved | Clean: `/{chatId}/list/{name}` |

---

## Appendix

### Random Name Generation

Lists get fun names like "Brave Alpaca", "Zealous Penguin". Copy adjective/animal arrays from reference implementation.

### References

- [Telegram Bot API - setWebhook](https://core.telegram.org/bots/api#setwebhook)
- [Turso Documentation](https://docs.turso.tech/)
- [Original Rust implementation](./reference_repo/outof/)
