<!-- DropdownMenuItem.svelte -->
<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import type { Readable } from "svelte/store";
  
  export let className: string = "";
  export let inset: boolean = false;
  export let disabled: boolean = false;

  const dropdownStore = getContext<Readable<{ close: () => void }> | undefined>("dropdown");
  let dropdown: { close: () => void; } = { close: () => {} };

  if (dropdownStore) {
    dropdownStore.subscribe((value: { close: () => void; }) => {
      dropdown = value;
    });
  }

  const dispatch = createEventDispatcher();

  function handleClick(event: MouseEvent) {
    if (disabled) return;
    dispatch("select", event);
    dropdown.close();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled) {
        dispatch("select", event);
        dropdown.close();
      }
    }
  }
</script>

<div
  class="dropdown-item {className} {inset ? 'inset' : ''}"
  role="menuitem"
  tabindex={disabled ? -1 : 0}
  data-disabled={disabled ? true : undefined}
  on:click={handleClick}
  on:keydown={handleKeydown}
  {...$$restProps}
>
  <slot />
</div>