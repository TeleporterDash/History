// src/helpers/canvasUtils.ts
import type { LevelData } from '../stores/levelStore';
import type { Tool } from '../stores/editorStore';

// Color mapping for blocks
export const COLOR_MAP: Record<string, string> = {
  '0': '#000000',  // Black
  '-1': '#ff6b6b', // Red
  '-2': '#4ecdc4', // Cyan
  '-3': '#45b7d1', // Blue
  '-4': '#96ceb4', // Green
  '-5': '#ff9f1c', // Orange
  '-6': '#ffbe0b', // Yellow
  '-7': '#ff006e', // Pink
  '-8': '#8338ec', // Purple
  '-9': '#3a86ff'  // Light Blue
};

// Convert grid coordinates to canvas pixels
export function gridToCanvas(x: number, y: number, gridSize: number) {
  return { px: x * gridSize, py: y * gridSize };
}

// Convert canvas pixels to grid coordinates
export function canvasToGrid(px: number, py: number, gridSize: number) {
  return { x: Math.floor(px / gridSize), y: Math.floor(py / gridSize) };
}

// Draw the level matrix on a canvas context
export function drawLevel(
  ctx: CanvasRenderingContext2D,
  level: LevelData,
  gridSize: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  level.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell || cell === 0) return;

      let type: string | number = 0;
      let color = '';
      let rotation = 0;

      if (typeof cell === 'string') {
        const parts = cell.split('/');
        type = parseInt(parts[0]);
        if (parts[1]?.startsWith('-')) color = COLOR_MAP[parts[1]] || '';
        if (parts[2]?.startsWith('@')) rotation = parseInt(parts[2].slice(1));
      } else {
        type = cell;
      }

      const { px, py } = gridToCanvas(x, y, gridSize);

      ctx.save();
      ctx.translate(px + gridSize / 2, py + gridSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillStyle = color || '#fff';

      switch (type) {
        case 1: // Block
          ctx.fillRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize);
          break;
        case 2: // Spike
          ctx.beginPath();
          ctx.moveTo(-gridSize / 2, gridSize / 2);
          ctx.lineTo(0, -gridSize / 2);
          ctx.lineTo(gridSize / 2, gridSize / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case 3: // Teleporter
          ctx.beginPath();
          ctx.arc(0, 0, gridSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ff0';
          ctx.fill();
          break;
        case 4: // Finish
          ctx.fillStyle = '#0f0';
          ctx.fillRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize);
          break;
      }

      ctx.restore();
    });
  });
}

// Place a block/tool into the level matrix
export function placeTool(
  level: LevelData,
  tool: Tool,
  gridX: number,
  gridY: number
): LevelData {
  const matrix = level.matrix.map(row => [...row]);
  const cellValue = `${tool.type}${tool.color ? '/' + tool.color : ''}${
    tool.rotation ? '/@' + tool.rotation : ''
  }`;

  if (gridY < matrix.length && gridX < matrix[0].length) {
    matrix[gridY][gridX] = cellValue;
  }

  return { ...level, matrix };
}
