import { createClient } from '@libsql/client';
import { Config, Context, Effect, Layer, Redacted } from 'effect';
import { drizzle } from 'drizzle-orm/libsql';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

// Configuration tag (internal)
class TursoConfig extends Context.Tag('@app/TursoConfig')<
  TursoConfig,
  { readonly url: string; readonly authToken: string | undefined }
>() {}

const TursoConfigLive = Layer.effect(
  TursoConfig,
  Effect.gen(function* () {
    const url = yield* Config.string('TURSO_DATABASE_URL');
    const authToken = yield* Config.redacted('TURSO_AUTH_TOKEN').pipe(
      Effect.map(token => Redacted.value(token)),
      Effect.catchAll(() => Effect.succeed(undefined))
    );
    return { url, authToken };
  })
);

// Service definition
export class Db extends Effect.Service<Db>()('@app/Db', {
  effect: Effect.gen(function* () {
    const config = yield* TursoConfig;

    const client = createClient({
      url: config.url,
      authToken: config.authToken
    });

    return drizzle(client, { schema });
  })
}) {
  static layer = this.Default;
  static Live = this.layer.pipe(Layer.provide(TursoConfigLive));
}

// Type export for convenience
export type Database = LibSQLDatabase<typeof schema>;
