# PROJECT KNOWLEDGE BASE

**Project:** Outof - Minimal grocery list service for Telegram
**Generated:** 2026-02-02

## OVERVIEW

Next.js 16 App Router application with Effect-TS service architecture, Drizzle ORM (Turso/SQLite), and Tailwind CSS. Telegram bot webhook receives commands, stores items in database, and serves shopping list pages.

## CRITICAL RULES

- **Use `pnpm` exclusively** - not npm or yarn
- **Run `pnpm tsc` before finishing** - ensure types pass
- **Run `pnpm lint` to check for errors** - fix any issues

### TypeScript Rules

| Rule                                            | Description                        |
| ----------------------------------------------- | ---------------------------------- |
| `@typescript-eslint/no-explicit-any`            | NEVER use `any` type               |
| `@typescript-eslint/consistent-type-assertions` | NEVER use `as` type casts          |
| `@typescript-eslint/consistent-type-imports`    | Use `import type` for type imports |

## STRUCTURE

```
outof/
├── app/
│   ├── api/telegram/webhook/   # Telegram webhook handler
│   ├── [chatId]/list/[name]/   # Shopping list pages
│   └── page.tsx                # Landing page
├── lib/
│   ├── core/
│   │   ├── item/               # Item domain logic
│   │   ├── list/               # Shopping list logic + name generator
│   │   └── errors/             # Shared domain errors
│   ├── services/
│   │   ├── db/                 # Turso database (Drizzle)
│   │   └── telegram/           # Telegram Bot API
│   └── layers.ts               # AppLayer composition
└── reference_repo/             # Original Rust implementation (reference only)
```

## WHERE TO LOOK

| Task                | Location                              | Notes                                |
| ------------------- | ------------------------------------- | ------------------------------------ |
| Telegram commands   | `app/api/telegram/webhook/route.ts`   | /outof, /list, /generate handlers    |
| Item queries        | `lib/core/item/queries.ts`            | CRUD for items                       |
| Shopping list logic | `lib/core/list/queries.ts`            | Create list, remove items            |
| Name generation     | `lib/core/list/name-generator.ts`     | Random adjective + animal            |
| Database schema     | `lib/services/db/schema.ts`           | item, shoppingList, shoppingListItem |
| Db service          | `lib/services/db/live-layer.ts`       | Turso connection via libsql          |
| Telegram service    | `lib/services/telegram/live-layer.ts` | Send messages via Bot API            |

## CODE MAP

| Symbol     | Type    | Location                              | Role                     |
| ---------- | ------- | ------------------------------------- | ------------------------ |
| `AppLayer` | Layer   | `lib/layers.ts`                       | Merged Db + Telegram     |
| `Db`       | Service | `lib/services/db/live-layer.ts`       | Drizzle client for Turso |
| `Telegram` | Service | `lib/services/telegram/live-layer.ts` | Bot API message sending  |

## DOMAIN MODELS

| Table                | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `item`               | Items the household is "out of"            |
| `shopping_list`      | Generated shopping lists with random names |
| `shopping_list_item` | Snapshot of items in a shopping list       |

## CONVENTIONS

### Code Style (Prettier)

- **Semicolons**
- **No trailing commas**
- Single quotes, 2-space indent, max 100 chars

### File Naming

- **All files use kebab-case** - `live-layer.ts`, `name-generator.ts`
- **Queries** in `queries.ts` files

### Effect-TS Service Pattern

```typescript
export class ServiceName extends Effect.Service<ServiceName>()('@app/ServiceName', {
  effect: Effect.gen(function* () {
    /* ... */
  })
}) {
  static layer = this.Default;
  static Live = this.layer.pipe(Layer.provide(ConfigLive));
}
```

### Configuration

- Use `Config.string('VAR')` or `Config.redacted('SECRET')`
- Exception: `process.env.TELEGRAM_WEBHOOK_SECRET` in route (needed at request time)

### Imports

- Use `@/` path alias for project imports
- No barrel files - import directly from source

## FLOW

### Adding Items

```
User → /outof milk, eggs → Webhook → createItems() → Db → "Added items milk, eggs"
```

### Generating List

```
User → /generate → Webhook → getItemsByChatId() → createShoppingList() → Db
     → "[Brave Alpaca](outof.im/{chatId}/list/brave-alpaca)"
```

### Shopping

```
User → Opens link → page.tsx → getShoppingList() → Renders items
     → Clicks ✓ → route.ts → removeFromShoppingList(bought=true) → Redirect
```

## ENVIRONMENT VARIABLES

| Variable                  | Description                     |
| ------------------------- | ------------------------------- |
| `TURSO_DATABASE_URL`      | Turso database URL              |
| `TURSO_AUTH_TOKEN`        | Turso auth token                |
| `TELEGRAM_BOT_TOKEN`      | Bot API token from @BotFather   |
| `TELEGRAM_WEBHOOK_SECRET` | Secret for webhook verification |

## NOTES

- Shopping list URLs use slugified names: "Brave Alpaca" → "brave-alpaca"
- When all items removed from shopping list, the list is deleted
- "Skip" removes from current list only; "Bought" removes from both lists
- No auth - data scoped by Telegram chat_id
