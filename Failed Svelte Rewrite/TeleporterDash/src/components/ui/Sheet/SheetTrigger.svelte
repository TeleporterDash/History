<!-- SheetTrigger.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  export let asChild = false;
  export let className = '';
  
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('click');
  }
</script>

{#if asChild}
  <slot {handleClick} />
{:else}
  <button type="button" class="{className}" on:click={handleClick}>
    <slot />
  </button>
{/if}