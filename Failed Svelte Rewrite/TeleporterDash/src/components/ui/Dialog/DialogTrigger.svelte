<script lang="ts">
  import { createEventDispatcher } from "svelte";
  
  export let className: string = "";
  
  const dispatch = createEventDispatcher();
  
  function handleClick(event: MouseEvent) {
    dispatch("click", event);
  }
</script>

<button class="{className}" on:click={handleClick} {...$$restProps}>
  <slot />
</button>
