import { Data } from 'effect';

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  message: string;
  entity: string;
  id: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  message: string;
  field?: string;
}> {}
