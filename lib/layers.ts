import { Layer } from 'effect';
import { Db } from './services/db/live-layer';
import { Telegram } from './services/telegram/live-layer';

// Combined app layer
export const AppLayer = Layer.mergeAll(Db.Live, Telegram.Live);
