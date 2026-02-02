import { Effect } from 'effect';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { AppLayer } from '@/lib/layers';
import { getShoppingList, removeFromShoppingList } from '@/lib/core/list/queries';

type Props = {
  params: Promise<{
    chatId: string;
    name: string;
    itemId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { chatId, name, itemId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action !== 'bought' && action !== 'skip') {
    return new Response('Invalid action', { status: 400 });
  }

  const alsoDeleteFromMaster = action === 'bought';

  await Effect.runPromise(
    Effect.gen(function* () {
      // Get the shopping list first to get its ID
      const list = yield* getShoppingList(chatId, name);
      if (!list) {
        return;
      }

      yield* removeFromShoppingList(list.id, itemId, alsoDeleteFromMaster);
    }).pipe(Effect.provide(AppLayer))
  );

  redirect(`/${chatId}/list/${name}`);
}
