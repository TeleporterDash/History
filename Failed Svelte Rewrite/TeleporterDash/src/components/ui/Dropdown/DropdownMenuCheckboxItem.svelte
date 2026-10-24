<!-- DropdownMenuCheckboxItem.svelte -->
<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import { Check } from "lucide-svelte";

  export let className: string = "";
  export let checked: boolean = false;
  export let disabled: boolean = false;

  const dropdownStore = getContext("dropdown");
  const dispatch = createEventDispatcher();

  function handleClick(event: MouseEvent) {
    if (disabled) return;
    checked = !checked;
    dispatch("checkedChange", { checked, event });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!disabled) {
        checked = !checked;
        dispatch("checkedChange", { checked, event });
      }
    }
  }
</script>

<div
  class="dropdown-checkbox-item {className}"
  role="menuitemcheckbox"
  aria-checked={checked}
  tabindex={disabled ? -1 : 0}
  data-disabled={disabled ? true : undefined}
  on:click={handleClick}
  on:keydown={handleKeydown}
  {...$$restProps}
>
  <span class="checkbox-indicator">
    {#if checked}
      <Check size={14} />
    {/if}
  </span>
  <slot />
</div>
