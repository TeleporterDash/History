
<!-- DropdownMenuRadioGroup.svelte -->
<script lang="ts">
  import { setContext, createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";

  export let value: string = "";

  const dispatch = createEventDispatcher();

  const radioStore = writable({
    value,
    setValue: (newValue: string) => {
      value = newValue;
      dispatch("valueChange", newValue);
      radioStore.update(store => ({ ...store, value: newValue }));
    }
  });

  setContext("radioGroup", radioStore);

  $: radioStore.update(store => ({ ...store, value }));
</script>

<div class="dropdown-radio-group" role="group" {...$$restProps}>
  <slot />
</div>

<style>
  @layer base {
    .dropdown-menu-root {
      position: relative;
      display: inline-block;
    }

    .dropdown-content {
      min-width: 12rem;
      overflow: hidden;
      background-color: var(--popup, white);
      color: var(--popup-foreground, #000);
      border-radius: var(--radius, 0.375rem);
      border: 1px solid var(--border, #e5e5e5);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      padding: var(--spacing-2, 0.5rem);
      animation: scaleIn var(--animation-duration-normal, 200ms) ease-out;
      z-index: var(--z-overlay, 1000);
      position: absolute;
      top: calc(100% + var(--spacing-1, 0.25rem));
      left: 0;
    }

    .dropdown-item,
    .dropdown-checkbox-item,
    .dropdown-radio-item {
      position: relative;
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      border-radius: var(--radius-sm, 0.25rem);
      font-size: 0.9375rem;
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
      color: var(--popup-foreground, #000);
      outline: none;
      transition: background-color var(--animation-duration-fast, 150ms),
        color var(--animation-duration-fast, 150ms);
    }

    .dropdown-item:hover,
    .dropdown-checkbox-item:hover,
    .dropdown-radio-item:hover {
      background-color: color-mix(in srgb, var(--primary, #007bff) 8%, transparent);
      color: var(--primary, #007bff);
    }

    .dropdown-item:focus,
    .dropdown-checkbox-item:focus,
    .dropdown-radio-item:focus {
      background-color: color-mix(in srgb, var(--primary, #007bff) 12%, transparent);
      color: var(--primary, #007bff);
      outline: none;
    }

    .dropdown-item[data-disabled],
    .dropdown-checkbox-item[data-disabled],
    .dropdown-radio-item[data-disabled] {
      pointer-events: none;
      opacity: 0.5;
    }

    .dropdown-checkbox-item,
    .dropdown-radio-item {
      padding-left: var(--spacing-8, 2rem);
    }

    .checkbox-indicator,
    .radio-indicator {
      position: absolute;
      left: var(--spacing-3, 0.75rem);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .checkbox-indicator {
      height: 1rem;
      width: 1rem;
    }

    .radio-indicator {
      height: 1rem;
      width: 1rem;
    }

    .radio-indicator-circle {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--radius-full, 9999px);
      background-color: currentColor;
    }

    .dropdown-label {
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--muted-foreground, #6c757d);
    }

    .dropdown-separator {
      height: 1px;
      margin: var(--spacing-2, 0.5rem) 0;
      background-color: var(--border, #e5e5e5);
    }

    .dropdown-shortcut {
      margin-left: auto;
      font-size: 0.75rem;
      letter-spacing: 0.025em;
      opacity: 0.6;
    }

    .inset {
      padding-left: var(--spacing-8, 2rem);
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.97);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
</style>