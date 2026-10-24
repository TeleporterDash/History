<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { editorStore, pushUndo, selectTool } from '../../stores/editorStore';
  import { drawLevel, gridToCanvas, canvasToGrid, COLOR_MAP } from '../../helpers/canvasUtils';
  import Palette from './Palette.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { EditorState, Tool } from '../../stores/editorStore';

  let canvasEl: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  const gridSize = 32;

  // Reactive store
  let editorStoreValue: EditorState;
  editorStore.subscribe(value => (editorStoreValue = value));

  onMount(() => {
    ctx = canvasEl.getContext('2d')!;
    drawGrid();
    drawCurrentLevel();

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  });

  function resizeCanvas() {
    canvasEl.width = window.innerWidth - 32;
    canvasEl.height = window.innerHeight - 200;
    drawGrid();
    drawCurrentLevel();
  }

  function drawGrid() {
    const { width, height } = canvasEl;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#555';
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawCurrentLevel() {
    if (editorStoreValue.levelData) {
      drawLevel(ctx, editorStoreValue.levelData, gridSize);
    }
  }

  function handleClick(event: MouseEvent) {
    if (!editorStoreValue.levelData) return;

    const rect = canvasEl.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const { x, y } = canvasToGrid(canvasX, canvasY, gridSize);

    pushUndo(editorStoreValue.levelData); // Save state before placing
    const updatedLevel = structuredClone(editorStoreValue.levelData);

    // Place/remove tool
    const currentCell = updatedLevel.matrix[y]?.[x];
    if (currentCell && currentCell !== 0) {
      updatedLevel.matrix[y][x] = 0; // Remove block on click
    } else {
      const tool: Tool = editorStoreValue.selectedTool;
      const colorPart = tool.color ? tool.color : '';
      const rotationPart = tool.rotation ? `@${tool.rotation}` : '';
      updatedLevel.matrix[y][x] = `${tool.type}${colorPart ? '/' + colorPart : ''}${
        rotationPart ? '/' + rotationPart : ''
      }`;
    }

    editorStore.update(state => ({ ...state, levelData: updatedLevel }));
    drawGrid();
    drawCurrentLevel();
  }
</script>

<div class="editor-container">
  <Toolbar />
  <div class="canvas-wrapper">
    <canvas
      bind:this={canvasEl}
      width="1024"
      height="512"
      on:click={handleClick}
    ></canvas>
    <Palette />
  </div>
</div>

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100vh;
    padding: 1rem;
    box-sizing: border-box;
  }

  .canvas-wrapper {
    position: relative;
    flex-grow: 1;
  }

  canvas {
    border: 1px solid #222;
    background: #111;
    display: block;
  }
</style>
