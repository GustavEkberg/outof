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

function parseAction(value: string | null): 'bought' | 'skip' | null {
  if (value === 'bought' || value === 'skip') return value;
  return null;
}

async function handleAction(
  chatId: string,
  name: string,
  itemId: string,
  action: 'bought' | 'skip'
) {
  const alsoDeleteFromMaster = action === 'bought';

  return Effect.runPromise(
    Effect.gen(function* () {
      const list = yield* getShoppingList(chatId, name);
      if (!list) {
        return { listEmpty: false, deletedItemId: null };
      }

      return yield* removeFromShoppingList(list.id, itemId, alsoDeleteFromMaster);
    }).pipe(Effect.provide(AppLayer))
  );
}

// POST: JSON API for client-side interactions
export async function POST(request: NextRequest, { params }: Props) {
  const { chatId, name, itemId } = await params;
  const body = await request.json();
  const parsed = typeof body === 'object' && body !== null && 'action' in body ? body : {};
  const action = parseAction('action' in parsed ? String(parsed.action) : null);

  if (!action) {
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  }

  const result = await handleAction(chatId, name, itemId, action);
  return Response.json(result);
}

// GET: Redirect fallback for non-JS clients
export async function GET(request: NextRequest, { params }: Props) {
  const { chatId, name, itemId } = await params;
  const action = parseAction(request.nextUrl.searchParams.get('action'));

  if (!action) {
    return new Response('Invalid action', { status: 400 });
  }

  await handleAction(chatId, name, itemId, action);
  redirect(`/${chatId}/list/${name}`);
}
