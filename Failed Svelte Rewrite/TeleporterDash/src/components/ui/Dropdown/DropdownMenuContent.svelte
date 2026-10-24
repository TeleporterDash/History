<!-- DropdownMenuContent.svelte -->
<script lang="ts">
  import { getContext, onDestroy, tick } from "svelte";
  import type { Readable } from "svelte/store";

  export let className: string = "";
  export const _sideOffset: number = 4;

  const dropdownStore = getContext<Readable<{ close: () => void }> | undefined>("dropdown");
  let dropdown: { open?: any; close: any; };

  if (dropdownStore) {
    dropdownStore.subscribe((value: { close: () => void; }) => {
      dropdown = value;
    });
  }
  
  let contentElement: HTMLDivElement;
  let currentFocusIndex = -1;
  let menuItems: HTMLElement[] = [];

  function updateMenuItems() {
    if (contentElement) {
      menuItems = Array.from(contentElement.querySelectorAll('[role="menuitem"]:not([data-disabled])')) as HTMLElement[];
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!dropdown.open) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        currentFocusIndex = currentFocusIndex < menuItems.length - 1 ? currentFocusIndex + 1 : 0;
        menuItems[currentFocusIndex]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        currentFocusIndex = currentFocusIndex > 0 ? currentFocusIndex - 1 : menuItems.length - 1;
        menuItems[currentFocusIndex]?.focus();
        break;
      case "Home":
        event.preventDefault();
        currentFocusIndex = 0;
        menuItems[currentFocusIndex]?.focus();
        break;
      case "End":
        event.preventDefault();
        currentFocusIndex = menuItems.length - 1;
        menuItems[currentFocusIndex]?.focus();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (currentFocusIndex >= 0 && menuItems[currentFocusIndex]) {
          menuItems[currentFocusIndex].click();
        }
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (contentElement && !contentElement.contains(event.target as Node)) {
      const trigger = document.querySelector('.dropdown-trigger');
      if (!trigger?.contains(event.target as Node)) {
        dropdown.close();
      }
    }
  }

  $: if (dropdown.open) {
    tick().then(() => {
      updateMenuItems();
      document.addEventListener("click", handleClickOutside);
    });
  } else {
    document.removeEventListener("click", handleClickOutside);
    currentFocusIndex = -1;
  }

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if dropdown.open}
  <div
    bind:this={contentElement}
    class="dropdown-content {className}"
    role="menu"
    aria-orientation="vertical"
    {...$$restProps}
  >
    <slot />
  </div>
{/if}