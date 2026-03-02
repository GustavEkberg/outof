import { Effect } from 'effect';
import { AppLayer } from '@/lib/layers';
import { getShoppingList } from '@/lib/core/list/queries';
import { slugToListName } from '@/lib/core/list/name-generator';
import { ShoppingList } from './shopping-list';

type Props = {
  params: Promise<{
    chatId: string;
    name: string;
  }>;
};

export default async function ShoppingListPage({ params }: Props) {
  const { chatId, name } = await params;

  const list = await Effect.runPromise(
    getShoppingList(chatId, name).pipe(Effect.provide(AppLayer))
  );

  const displayName = slugToListName(name);

  if (!list) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90 mb-2">{displayName}</h1>
        <p className="text-white/40">List not found or already completed</p>
      </main>
    );
  }

  return (
    <ShoppingList
      chatId={chatId}
      nameSlug={name}
      displayName={list.name}
      items={list.items.map(i => ({ id: i.id, title: i.title, userName: i.userName }))}
    />
  );
}
