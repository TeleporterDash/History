// src/stores/editorStore.ts
import { writable } from 'svelte/store';
import type { LevelData } from './levelStore';

export type Tool = {
  name: string;
  type: number;      // 1=Block, 2=Spike, 3=Teleporter, 4=Finish
  rotation?: number; // 0, 90, 180, 270
  color?: string;    // Hex code or from COLOR_MAP
};

export interface EditorState {
  selectedTool: Tool;
  levelData: LevelData | null;
  undoStack: LevelData[];
  redoStack: LevelData[];
  snapToGrid: boolean;
  gridSize: number;
}

const initialState: EditorState = {
  selectedTool: { name: 'Block', type: 1, rotation: 0 },
  levelData: null,
  undoStack: [],
  redoStack: [],
  snapToGrid: true,
  gridSize: 32,
};

export const editorStore = writable<EditorState>(initialState);

// Helper functions for undo/redo
export function pushUndo(level: LevelData) {
  editorStore.update(state => {
    const undoStack = [...state.undoStack, JSON.parse(JSON.stringify(level))];
    return { ...state, undoStack, redoStack: [] };
  });
}

export function undo() {
  editorStore.update(state => {
    if (state.undoStack.length === 0 || !state.levelData) return state;
    const last = state.undoStack[state.undoStack.length - 1];
    const undoStack = state.undoStack.slice(0, -1);
    const redoStack = [...state.redoStack, state.levelData];
    return { ...state, levelData: last, undoStack, redoStack };
  });
}

export function redo() {
  editorStore.update(state => {
    if (state.redoStack.length === 0 || !state.levelData) return state;
    const next = state.redoStack[state.redoStack.length - 1];
    const redoStack = state.redoStack.slice(0, -1);
    const undoStack = [...state.undoStack, state.levelData];
    return { ...state, levelData: next, redoStack, undoStack };
  });
}

// Set selected tool
export function selectTool(tool: Tool) {
  editorStore.update(state => ({ ...state, selectedTool: tool }));
}

// Toggle snapping
export function toggleSnap() {
  editorStore.update(state => ({ ...state, snapToGrid: !state.snapToGrid }));
}

// Update level data
export function setLevel(level: LevelData) {
  editorStore.update(state => ({ ...state, levelData: level }));
}
