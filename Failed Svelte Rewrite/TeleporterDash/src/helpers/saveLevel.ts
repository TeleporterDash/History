import { set } from 'idb-keyval';
import type { LevelData } from '../stores/levelStore';

/**
 * Save a level to IndexedDB by its id
 * @param level LevelData object
 */
export async function saveLevel(level: LevelData) {
  if (!level?.id) throw new Error('Level must have an id to be saved');
  try {
    await set(`level-${level.id}`, level);
    console.log(`Level ${level.id} saved successfully`);
  } catch (err) {
    console.error('Failed to save level', err);
  }
}

/**
 * Load a level from IndexedDB by id
 */
export async function loadLevel(id: number): Promise<LevelData | undefined> {
  try {
    const level = await import('idb-keyval').then(({ get }) => get(`level-${id}`));
    return level;
  } catch (err) {
    console.error('Failed to load level', err);
    return undefined;
  }
}
