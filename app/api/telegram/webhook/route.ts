import { Effect } from 'effect';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AppLayer } from '@/lib/layers';
import { Telegram } from '@/lib/services/telegram/live-layer';
import type { Db } from '@/lib/services/db/live-layer';
import { getItemsByChatId, createItems } from '@/lib/core/item/queries';
import { createShoppingList, listNameToSlug } from '@/lib/core/list/queries';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const DOMAIN = 'https://outof.im';

// Telegram Update types (minimal)
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: string;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

function getUserName(user: TelegramUser | undefined): string {
  if (!user) return 'Unknown';
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.first_name || user.username || 'Unknown';
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

const handleCommand = (
  chatId: string,
  command: string,
  args: string,
  userName: string
): Effect.Effect<string, unknown, Telegram | Db> =>
  Effect.gen(function* () {
    const telegram = yield* Telegram;

    switch (command) {
      case '/outof': {
        if (!args.trim()) {
          yield* telegram.send(chatId, 'Usage: /outof item1, item2, ...');
          return 'empty';
        }

        const titles = args.split(',').map(s => s.trim());
        const items = yield* createItems(chatId, titles, userName);

        if (items.length === 0) {
          yield* telegram.send(chatId, 'No valid items to add');
          return 'no items';
        }

        const itemList = items.map(i => i.title).join(', ');
        yield* telegram.send(chatId, `Added items ${itemList}`);
        return 'added';
      }

      case '/list': {
        const items = yield* getItemsByChatId(chatId);

        if (items.length === 0) {
          yield* telegram.send(chatId, 'No items');
          return 'empty';
        }

        const formatted = items
          .map(item => `${item.title} (${item.userName}) ${formatDate(item.createdAt)}`)
          .join('\n');

        yield* telegram.send(chatId, formatted);
        return 'listed';
      }

      case '/generate': {
        const items = yield* getItemsByChatId(chatId);

        if (items.length === 0) {
          yield* telegram.send(chatId, 'No items to generate list');
          return 'empty';
        }

        const list = yield* createShoppingList(chatId, items);

        const slug = listNameToSlug(list.name);
        const url = `${DOMAIN}/${chatId}/list/${slug}`;

        // Escape special characters for MarkdownV2
        const escapedName = list.name.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
        const message = `[${escapedName}](${url})`;

        yield* telegram.send(chatId, message, 'MarkdownV2');
        return 'generated';
      }

      default:
        return 'unknown';
    }
  });

export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secretHeader = request.headers.get('x-telegram-bot-api-secret-token');
  if (WEBHOOK_SECRET && secretHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update: TelegramUpdate = await request.json();

    // Only handle messages with text
    if (!update.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const text = update.message.text;
    const chatId = String(update.message.chat.id);
    const userName = getUserName(update.message.from);

    // Parse command
    const match = text.match(/^(\/\w+)(?:@\w+)?(?:\s+(.*))?$/);
    if (!match) {
      // Not a command, ignore
      return NextResponse.json({ ok: true });
    }

    const command = match[1].toLowerCase();
    const args = match[2] || '';

    await Effect.runPromise(
      handleCommand(chatId, command, args, userName).pipe(
        Effect.provide(AppLayer),
        Effect.catchAll(error => {
          console.error('Command handler error:', error);
          return Effect.succeed('error');
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
