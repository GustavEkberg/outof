import { Effect } from 'effect';
import { eq } from 'drizzle-orm';
import { Db } from '@/lib/services/db/live-layer';
import { item } from '@/lib/services/db/schema';
import type { Item } from '@/lib/services/db/schema';

export const getItemsByChatId = (chatId: string): Effect.Effect<Item[], never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;
    return yield* Effect.promise(() => db.select().from(item).where(eq(item.chatId, chatId)));
  }).pipe(Effect.withSpan('item.getItemsByChatId'));

export const createItems = (
  chatId: string,
  titles: string[],
  userName: string
): Effect.Effect<Item[], never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;

    const nonEmptyTitles = titles.map(t => t.trim()).filter(t => t.length > 0);

    if (nonEmptyTitles.length === 0) {
      return [];
    }

    const newItems = nonEmptyTitles.map(title => ({
      chatId,
      title,
      userName
    }));

    return yield* Effect.promise(() => db.insert(item).values(newItems).returning());
  }).pipe(Effect.withSpan('item.createItems'));

export const deleteItem = (itemId: string): Effect.Effect<void, never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;
    yield* Effect.promise(() => db.delete(item).where(eq(item.id, itemId)));
  }).pipe(Effect.withSpan('item.deleteItem'));

export const deleteItemsByIds = (itemIds: string[]): Effect.Effect<void, never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;
    for (const id of itemIds) {
      yield* Effect.promise(() => db.delete(item).where(eq(item.id, id)));
    }
  }).pipe(Effect.withSpan('item.deleteItemsByIds'));
