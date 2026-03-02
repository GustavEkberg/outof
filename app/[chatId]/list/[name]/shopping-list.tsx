'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { removeItemAction, getListItems } from './actions';

const POLL_INTERVAL = 5000;

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

export function ShoppingList({ chatId, nameSlug, displayName, items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [isPending, setIsPending] = useState(false);

  // Poll for changes from other users
  useEffect(() => {
    const id = setInterval(async () => {
      const serverItems = await getListItems(chatId, nameSlug);
      setItems(prev => {
        const serverIds = new Set(serverItems.map(i => i.id));
        // Only update if items were removed (by another user)
        const changed = prev.some(i => !serverIds.has(i.id));
        return changed ? prev.filter(i => serverIds.has(i.id)) : prev;
      });
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [chatId, nameSlug]);

  const handleAction = useCallback(
    (itemId: string, action: 'bought' | 'skip') => {
      // Optimistic removal
      setItems(prev => prev.filter(i => i.id !== itemId));
      setIsPending(true);
      removeItemAction(chatId, nameSlug, itemId, action).finally(() => setIsPending(false));
    },
    [chatId, nameSlug]
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

      <div className="flex-1 flex justify-center px-4 py-3 overflow-x-hidden">
        <motion.ul className="space-y-2 w-full max-w-lg" layout>
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

const SWIPE_THRESHOLD = 80;

function ShoppingListItem({
  item,
  onAction,
  disabled
}: {
  item: ListItem;
  onAction: (id: string, action: 'bought' | 'skip') => void;
  disabled: boolean;
}) {
  const x = useMotionValue(0);
  const triggered = useRef(false);

  // Background opacity tied to drag distance
  const boughtBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 3, 0], [1, 0.3, 0]);
  const skipBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD / 3, SWIPE_THRESHOLD], [0, 0.3, 1]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Bought background (green, revealed on swipe left) */}
      <motion.div
        style={{ opacity: boughtBgOpacity }}
        className="absolute inset-0 bg-emerald-500/20 flex items-center justify-end px-5 pointer-events-none"
      >
        <CheckIcon className="size-6 text-emerald-400" />
      </motion.div>

      {/* Skip background (red, revealed on swipe right) */}
      <motion.div
        style={{ opacity: skipBgOpacity }}
        className="absolute inset-0 bg-red-500/20 flex items-center justify-start px-5 pointer-events-none"
      >
        <XIcon className="size-6 text-red-400" />
      </motion.div>

      {/* Draggable row */}
      <motion.div
        style={{ x }}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (triggered.current) return;
          if (info.offset.x < -SWIPE_THRESHOLD) {
            triggered.current = true;
            onAction(item.id, 'bought');
          } else if (info.offset.x > SWIPE_THRESHOLD) {
            triggered.current = true;
            onAction(item.id, 'skip');
          }
        }}
        className="relative flex items-center gap-3 px-2 py-1 bg-black"
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

        <span className="flex-1 text-[15px] text-white/80 leading-tight py-2.5 select-none text-center">
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
      </motion.div>
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
