# Outof

Minimal grocery list service for Telegram. Track items you've run out of and generate shareable shopping lists.

## Usage

Send commands to [@iamoutof_bot](https://t.me/iamoutof_bot):

- `/outof milk, eggs, bread` - Add items you've run out of
- `/list` - Show all current items
- `/generate` - Create a shopping list with a shareable link

### Shopping List

When you generate a list, you get a link like `outof.im/123456/list/brave-alpaca`. Each item has two buttons:

- **X (Skip)** - Remove from current list only (still need it, just not buying now)
- **✓ (Bought)** - Remove from both lists (purchased!)

## Development

### Prerequisites

- Node.js 20+
- pnpm
- Turso account (or local SQLite for dev)
- Telegram bot token

### Setup

1. Clone and install:

   ```bash
   pnpm install
   ```

2. Copy env example:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local`:

   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_WEBHOOK_SECRET=your-secret
   ```

4. Push database schema:

   ```bash
   pnpm db:push
   ```

5. Run dev server:
   ```bash
   pnpm dev
   ```

### Register Telegram Webhook

After deploying, register the webhook with Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://outof.im/api/telegram/webhook",
    "secret_token": "<YOUR_WEBHOOK_SECRET>"
  }'
```

## Tech Stack

- Next.js 16 (App Router)
- Effect-TS (service architecture)
- Drizzle ORM + Turso (SQLite)
- Tailwind CSS
- Vercel (hosting)

## License

MIT
