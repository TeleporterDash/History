<script lang="ts">
  import { editorStore } from '../../stores/editorStore';
  import { saveLevel } from '../../helpers/saveLevel';
  import { get } from 'svelte/store';

  function handleSave() {
    const levelData = get(editorStore).levelData;
    if (levelData) {
      saveLevel(levelData)
        .then(() => {
          alert('Level saved successfully!');
        })
        .catch(err => {
          console.error('Error saving level:', err);
          alert('Failed to save level.');
        });
    } else {
      alert('No level data to save.');
    }
  }
</script>

<div class="toolbar">
  <button on:click={handleSave}>Save</button>
  <button on:click={() => editorStore.update(s => ({ ...s, undo: true }))}>Undo</button>
  <button on:click={() => editorStore.update(s => ({ ...s, redo: true }))}>Redo</button>
</div>

<style>
  .toolbar { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
</style>
