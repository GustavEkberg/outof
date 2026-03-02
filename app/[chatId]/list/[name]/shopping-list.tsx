'use client';

import { useOptimistic, useTransition, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ListItem = {
  id: string;
  title: string;
  userName: string;
};

type Props = {
  chatId: string;
  nameSlug: string;
  displayName: string;
  items: ListItem[];
};

async function performAction(
  chatId: string,
  nameSlug: string,
  itemId: string,
  action: 'bought' | 'skip'
) {
  const res = await fetch(`/${chatId}/list/${nameSlug}/item/${itemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  if (!res.ok) throw new Error('Action failed');
}

export function ShoppingList({ chatId, nameSlug, displayName, items: initialItems }: Props) {
  const [isPending, startTransition] = useTransition();
  const [items, removeItem] = useOptimistic(initialItems, (state, itemId: string) =>
    state.filter(i => i.id !== itemId)
  );

  const handleAction = useCallback(
    (itemId: string, action: 'bought' | 'skip') => {
      startTransition(async () => {
        removeItem(itemId);
        await performAction(chatId, nameSlug, itemId, action);
      });
    },
    [chatId, nameSlug, removeItem, startTransition]
  );

  if (items.length === 0) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="text-5xl mb-6">
            <CheckCircleIcon className="size-16 mx-auto text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white/90 mb-2">
            {displayName}
          </h1>
          <p className="text-white/40 text-lg">All done</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-black/70 border-b border-white/5 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-white/90 text-center">
          {displayName}
        </h1>
        <p className="text-xs text-white/30 text-center mt-0.5 tabular-nums">
          {items.length} {items.length === 1 ? 'item' : 'items'} left
        </p>
      </header>

      <div className="flex-1 px-4 py-3">
        <motion.ul className="space-y-2 max-w-lg mx-auto" layout>
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onAction={handleAction}
                disabled={isPending}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </main>
  );
}

function ShoppingListItem({
  item,
  onAction,
  disabled
}: {
  item: ListItem;
  onAction: (id: string, action: 'bought' | 'skip') => void;
  disabled: boolean;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 80, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-2 py-1"
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onAction(item.id, 'skip')}
        disabled={disabled}
        className="shrink-0 flex items-center justify-center size-11 rounded-xl
          text-white/25 hover:text-red-400 hover:bg-red-400/10
          active:text-red-400 active:bg-red-400/10
          transition-colors duration-150 disabled:opacity-30"
        aria-label={`Skip ${item.title}`}
      >
        <XIcon className="size-5" />
      </motion.button>

      <span className="flex-1 text-[15px] text-white/80 leading-tight py-2.5 select-none">
        {item.title}
      </span>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onAction(item.id, 'bought')}
        disabled={disabled}
        className="shrink-0 flex items-center justify-center size-11 rounded-xl
          text-white/25 hover:text-emerald-400 hover:bg-emerald-400/10
          active:text-emerald-400 active:bg-emerald-400/10
          transition-colors duration-150 disabled:opacity-30"
        aria-label={`Mark ${item.title} as bought`}
      >
        <CheckIcon className="size-5" />
      </motion.button>
    </motion.li>
  );
}

// Inline SVG icons to avoid external dependencies

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
