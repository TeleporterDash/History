<!-- DropdownMenu.svelte -->
<script context="module" lang="ts">
  export type DropdownMenuProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  };
</script>

<script lang="ts">
  import { createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";

  export let open: boolean = false;

  const dispatch = createEventDispatcher();
  
  const dropdownStore = writable({
    open: false,
    close: () => {
      open = false;
      dispatch("openChange", false);
    },
    toggle: () => {
      open = !open;
      dispatch("openChange", open);
    }
  });

  setContext("dropdown", dropdownStore);

  $: dropdownStore.set({
    open,
    close: () => {
      open = false;
      dispatch("openChange", false);
    },
    toggle: () => {
      open = !open;
      dispatch("openChange", open);
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      open = false;
      dispatch("openChange", false);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="dropdown-menu-root">
  <slot />
</div>

