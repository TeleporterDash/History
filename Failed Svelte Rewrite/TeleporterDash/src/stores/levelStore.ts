// src/stores/levelStore.ts
import { writable } from 'svelte/store';
import { set, get, del, keys } from 'idb-keyval';

// Type definition for a level
export interface LevelData {
  id: number;
  author: string;
  title: string;
  matrix: (number | string)[][];
  music?: string;
  difficulty?: string;
  colorTransitionDuration?: number;
  colorTransitionDelay?: number;
}

// Writable store for current level in memory
export const currentLevel = writable<LevelData | null>(null);

// Save level to IndexedDB
export async function saveLevel(level: LevelData) {
  if (!level.id) {
    level.id = Date.now(); // fallback unique ID
  }
  await set(`level-${level.id}`, level);
  currentLevel.set(level);
  return level.id;
}

// Load level by ID
export async function loadLevel(id: number) {
  const level = await get<LevelData>(`level-${id}`);
  if (level) currentLevel.set(level);
  return level;
}

// Delete level by ID
export async function deleteLevel(id: number) {
  await del(`level-${id}`);
  const level = await get<LevelData>(`level-${id}`);
  if (!level) currentLevel.set(null);
}

// List all saved levels
export async function listLevels() {
  const allKeys = await keys();
  const levelKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('level-'));
  const allLevels = await Promise.all(levelKeys.map(k => get<LevelData>(k as string)));
  return allLevels.filter(Boolean) as LevelData[];
}

// Update current level in store and IndexedDB
export async function updateCurrentLevel(updater: (level: LevelData) => LevelData) {
  let updatedLevel: LevelData | null = null;
  currentLevel.update(level => {
    if (!level) return level;
    updatedLevel = updater(level);
    return updatedLevel;
  });
  if (updatedLevel) {
    await saveLevel(updatedLevel);
  }
  return updatedLevel;
}
