<!-- DropdownMenuTrigger.svelte -->
<script lang="ts">
  import { getContext } from "svelte";
  import type { Readable } from "svelte/store";

  export let className: string = "";
  export let asChild: boolean = false;

  const dropdownStore = getContext<Readable<{ close: () => void }> | undefined>(
    "dropdown"
  );
  let dropdown: { toggle?: any; open?: any; close?: () => void };

  if (dropdownStore) {
    dropdownStore.subscribe((value: { close: () => void }) => {
      dropdown = value;
    });
  }

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    dropdown.toggle();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dropdown.toggle();
    } else if (event.key === "ArrowDown" && dropdown.open) {
      event.preventDefault();
      const menu = document.querySelector(".dropdown-content");
      const firstItem = menu?.querySelector('[role="menuitem"]') as HTMLElement;
      firstItem?.focus();
    }
  }
</script>

{#if asChild}
  <slot {handleClick} {handleKeydown} />
{:else}
  <button
    class="dropdown-trigger {className}"
    on:click={handleClick}
    on:keydown={handleKeydown}
    aria-expanded={dropdown.open}
    aria-haspopup="menu"
    {...$$restProps}
  >
    <slot />
  </button>
{/if}
