import { Effect } from 'effect';
import { and, eq } from 'drizzle-orm';
import { Db } from '@/lib/services/db/live-layer';
import { shoppingList, shoppingListItem, item } from '@/lib/services/db/schema';
import type { ShoppingList, ShoppingListItem, Item } from '@/lib/services/db/schema';
import { generateListName, listNameToSlug } from './name-generator';

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingListItem[];
};

export const createShoppingList = (
  chatId: string,
  items: Item[]
): Effect.Effect<ShoppingList, never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;

    const name = generateListName();

    const [newList] = yield* Effect.promise(() =>
      db
        .insert(shoppingList)
        .values({
          chatId,
          name
        })
        .returning()
    );

    if (items.length > 0) {
      const listItems = items.map(i => ({
        shoppingListId: newList.id,
        itemId: i.id,
        title: i.title,
        userName: i.userName
      }));

      yield* Effect.promise(() => db.insert(shoppingListItem).values(listItems));
    }

    return newList;
  }).pipe(Effect.withSpan('list.createShoppingList'));

export const getShoppingList = (
  chatId: string,
  nameSlug: string
): Effect.Effect<ShoppingListWithItems | null, never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;

    // Convert slug back to name for lookup
    const name = nameSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const lists = yield* Effect.promise(() =>
      db
        .select()
        .from(shoppingList)
        .where(and(eq(shoppingList.chatId, chatId), eq(shoppingList.name, name)))
    );

    if (lists.length === 0) {
      return null;
    }

    const list = lists[0];

    const items = yield* Effect.promise(() =>
      db.select().from(shoppingListItem).where(eq(shoppingListItem.shoppingListId, list.id))
    );

    return { ...list, items };
  }).pipe(Effect.withSpan('list.getShoppingList'));

export const removeFromShoppingList = (
  shoppingListId: string,
  listItemId: string,
  alsoDeleteFromMaster: boolean
): Effect.Effect<{ listEmpty: boolean; deletedItemId: string | null }, never, Db> =>
  Effect.gen(function* () {
    const db = yield* Db;

    // Get the shopping list item to find the original item id
    const [listItem] = yield* Effect.promise(() =>
      db.select().from(shoppingListItem).where(eq(shoppingListItem.id, listItemId))
    );

    if (!listItem) {
      return { listEmpty: false, deletedItemId: null };
    }

    // Remove from shopping list
    yield* Effect.promise(() =>
      db.delete(shoppingListItem).where(eq(shoppingListItem.id, listItemId))
    );

    // If bought, also remove from master item list
    if (alsoDeleteFromMaster) {
      yield* Effect.promise(() => db.delete(item).where(eq(item.id, listItem.itemId)));
    }

    // Check if list is now empty
    const remaining = yield* Effect.promise(() =>
      db.select().from(shoppingListItem).where(eq(shoppingListItem.shoppingListId, shoppingListId))
    );

    // If list is empty, delete the shopping list
    if (remaining.length === 0) {
      yield* Effect.promise(() =>
        db.delete(shoppingList).where(eq(shoppingList.id, shoppingListId))
      );
    }

    return { listEmpty: remaining.length === 0, deletedItemId: listItem.itemId };
  }).pipe(Effect.withSpan('list.removeFromShoppingList'));

export { listNameToSlug };
