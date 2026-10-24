<script context="module" lang="ts">
  export type CheckboxProps = {
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    id?: string;
    required?: boolean;
    className?: string;
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Check } from "lucide-svelte";

  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let name: string | undefined = undefined;
  export let value: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let required: boolean = false;
  export let className: string = "";

  const dispatch = createEventDispatcher();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    dispatch("change", { checked, event });
  }

  function handleClick(event: MouseEvent) {
    dispatch("click", event);
  }

  function handleFocus(event: FocusEvent) {
    dispatch("focus", event);
  }

  function handleBlur(event: FocusEvent) {
    dispatch("blur", event);
  }
</script>

<div class="checkbox-wrapper">
  <input
    bind:checked
    {disabled}
    {name}
    {value}
    {id}
    {required}
    type="checkbox"
    class="checkbox {className}"
    on:change={handleChange}
    on:click={handleClick}
    on:focus={handleFocus}
    on:blur={handleBlur}
    {...$$restProps}
  />
  <Check class="checkmark" aria-hidden="true" size={16} stroke-width={3} />
</div>

<style>
  @layer base {
    .checkbox-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }

    .checkbox {
      appearance: none;
      position: relative;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--border, #e5e5e5);
      border-radius: var(--radius-sm, 0.25rem);
      background-color: transparent;
      cursor: pointer;
      margin: 0;
      padding: 0;
      transition: all var(--animation-duration-normal, 200ms)
        cubic-bezier(0.16, 1, 0.3, 1);
    }

    .checkbox:hover {
      border-color: var(--primary, #007bff);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary, #007bff) 15%, transparent);
    }

    .checkbox:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus, 0 0 0 2px currentColor);
      border-color: var(--primary, #007bff);
    }

    .checkbox:checked {
      background-color: var(--primary, #007bff);
      border-color: var(--primary, #007bff);
      transform: scale(1);
      animation: checkboxPulse var(--animation-duration-normal, 200ms)
        cubic-bezier(0.16, 1, 0.3, 1);
    }

    .checkbox:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--muted, #f5f5f5);
      border-color: var(--muted, #f5f5f5);
    }

    .checkmark {
      position: absolute;
      width: 1rem;
      height: 1rem;
      color: var(--primary-foreground, white);
      pointer-events: none;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity var(--animation-duration-normal, 200ms)
          cubic-bezier(0.16, 1, 0.3, 1),
        transform var(--animation-duration-normal, 200ms) cubic-bezier(0.16, 1, 0.3, 1);
    }

    .checkbox:checked + .checkmark {
      opacity: 1;
      transform: scale(1);
    }

    .checkbox:disabled + .checkmark {
      color: var(--muted-foreground, #6c757d);
    }

    @keyframes checkboxPulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary, #007bff) 40%, transparent);
      }
      70% {
        transform: scale(1.02);
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--primary, #007bff) 0%, transparent);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary, #007bff) 0%, transparent);
      }
    }
  }
</style>