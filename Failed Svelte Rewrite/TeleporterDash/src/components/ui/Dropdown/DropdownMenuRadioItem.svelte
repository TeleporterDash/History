<!-- DropdownMenuRadioItem.svelte -->
<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";
  
  export let className: string = "";
  export let value: string;
  export let disabled: boolean = false;

  const dropdownStore = getContext("dropdown");
  const radioStore = getContext<Writable<{ value: string; setValue: (v: string) => void }>>("radioGroup");
  const dispatch = createEventDispatcher();

  $: checked = radioStore ? $radioStore.value === value : false;

  function handleClick(event: MouseEvent) {
    if (disabled) return;
    if (radioStore) {
      $radioStore.setValue(value);
    }
    dispatch("select", { value, event });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled) {
        if (radioStore) {
          $radioStore.setValue(value);
        }
        dispatch("select", { value, event });
      }
    }
  }
</script>

<div
  class="dropdown-radio-item {className}"
  role="menuitemradio"
  aria-checked={checked}
  tabindex={disabled ? -1 : 0}
  data-disabled={disabled ? true : undefined}
  on:click={handleClick}
  on:keydown={handleKeydown}
  {...$$restProps}
>
  <span class="radio-indicator">
    {#if checked}
      <div class="radio-indicator-circle"></div>
    {/if}
  </span>
  <slot />
</div>
