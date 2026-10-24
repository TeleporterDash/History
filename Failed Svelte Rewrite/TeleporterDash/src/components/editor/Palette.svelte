<script lang="ts">
  import { editorStore } from '../../stores/editorStore';
  
  const tools = [
    { name: 'Block', type: 1 },
    { name: 'Spike', type: 2 },
    { name: 'Teleporter', type: 3 },
    { name: 'Finish', type: 4 }
  ];

  function selectTool(tool: { name: string; type: number; }) {
    editorStore.update(s => ({ ...s, selectedTool: tool }));
  }
</script>

<div class="palette">
  {#each tools as tool}
    <button on:click={() => selectTool(tool)}>
      {tool.name}
    </button>
  {/each}
</div>

<style>
  .palette { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
</style>
