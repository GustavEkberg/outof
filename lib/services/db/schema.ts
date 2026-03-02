import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// Items the household is "out of"
export const item = sqliteTable(
  'item',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    chatId: text('chat_id').notNull(),
    title: text('title').notNull(),
    userName: text('user_name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  table => [index('idx_item_chat_id').on(table.chatId)]
);

export type Item = typeof item.$inferSelect;
export type InsertItem = typeof item.$inferInsert;

// Generated shopping lists
export const shoppingList = sqliteTable(
  'shopping_list',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    chatId: text('chat_id').notNull(),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
  },
  table => [uniqueIndex('idx_shopping_list_chat_id_name').on(table.chatId, table.name)]
);

export type ShoppingList = typeof shoppingList.$inferSelect;
export type InsertShoppingList = typeof shoppingList.$inferInsert;

// Items in a specific shopping list (snapshot at generation)
export const shoppingListItem = sqliteTable(
  'shopping_list_item',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    shoppingListId: text('shopping_list_id')
      .notNull()
      .references(() => shoppingList.id, { onDelete: 'cascade' }),
    itemId: text('item_id').notNull(),
    title: text('title').notNull(),
    userName: text('user_name').notNull()
  },
  table => [uniqueIndex('idx_shopping_list_item_unique').on(table.shoppingListId, table.itemId)]
);

export type ShoppingListItem = typeof shoppingListItem.$inferSelect;
export type InsertShoppingListItem = typeof shoppingListItem.$inferInsert;
