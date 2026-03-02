'use server';

import { Effect } from 'effect';
import { revalidatePath } from 'next/cache';
import { AppLayer } from '@/lib/layers';
import { getShoppingList, removeFromShoppingList } from '@/lib/core/list/queries';

function parseAction(value: string): 'bought' | 'skip' | null {
  if (value === 'bought' || value === 'skip') return value;
  return null;
}

export async function removeItemAction(
  chatId: string,
  nameSlug: string,
  itemId: string,
  rawAction: string
) {
  const action = parseAction(rawAction);
  if (!action) return;

  const alsoDeleteFromMaster = action === 'bought';

  await Effect.runPromise(
    Effect.gen(function* () {
      const list = yield* getShoppingList(chatId, nameSlug);
      if (!list) return;

      yield* removeFromShoppingList(list.id, itemId, alsoDeleteFromMaster);
    }).pipe(Effect.provide(AppLayer))
  );

  revalidatePath(`/${chatId}/list/${nameSlug}`);
}
