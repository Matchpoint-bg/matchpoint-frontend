import { store } from '../storage/store';

/** Keeps data from the demo adapter and different API hosts in separate caches. */
export function queryScope(): string {
  return store.demo ? 'demo' : store.api;
}
