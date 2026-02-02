import { Effect } from 'effect';
import Link from 'next/link';
import { AppLayer } from '@/lib/layers';
import { getShoppingList } from '@/lib/core/list/queries';
import { slugToListName } from '@/lib/core/list/name-generator';

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
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">{displayName}</h1>
        <p className="text-gray-400">List not found or already completed</p>
      </main>
    );
  }

  if (list.items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">{list.name}</h1>
        <p className="text-green-400 text-xl">List complete!</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-8">{list.name}</h1>

      <div className="max-w-md mx-auto space-y-4">
        {list.items.map(item => (
          <div key={item.id} className="flex items-center justify-between text-xl py-2">
            <Link
              href={`/${chatId}/list/${name}/item/${item.id}?action=skip`}
              className="text-red-500 hover:text-red-400 text-2xl px-4 py-2"
              prefetch={false}
            >
              X
            </Link>

            <span className="flex-1 text-center">{item.title}</span>

            <Link
              href={`/${chatId}/list/${name}/item/${item.id}?action=bought`}
              className="text-green-500 hover:text-green-400 text-2xl px-4 py-2"
              prefetch={false}
            >
              ✓
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
