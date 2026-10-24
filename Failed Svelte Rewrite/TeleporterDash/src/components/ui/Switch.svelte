<script>
  import { createEventDispatcher } from 'svelte';
  
  export let checked = false;
  export let disabled = false;
  export let className = '';
  export let name = '';
  export let value = '';
  export let id = '';
  export let required = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (disabled) return;
    
    checked = !checked;
    dispatch('change', { checked });
  }

  /**
   * @param {{ key: string; preventDefault: () => void; }} event
   */
  function handleKeydown(event) {
    if (disabled) return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-disabled={disabled}
  aria-label="Toggle"
  class="switch-root {className}"
  class:checked
  class:disabled
  {disabled}
  {id}
  on:click={handleClick}
  on:keydown={handleKeydown}
  tabindex={disabled ? -1 : 0}
>
  <span class="switch-thumb" class:checked></span>
</button>

<!-- Hidden input for form compatibility -->
{#if name}
  <input 
    type="hidden" 
    {name} 
    {value} 
    {required}
  />
{/if}

<style>
  .switch-root {
    all: unset;
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 42px;
    height: 24px;
    background-color: var(--muted);
    border-radius: var(--radius-full);
    transition: background-color var(--animation-duration-normal) ease;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .switch-root:hover:not(.disabled) {
    background-color: var(--muted-foreground);
  }

  .switch-root:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  .switch-root.checked {
    background-color: var(--primary);
  }

  .switch-root.checked:hover:not(.disabled) {
    background-color: color-mix(in srgb, var(--primary), black 10%);
  }

  .switch-root.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch-thumb {
    display: block;
    width: 20px;
    height: 20px;
    background-color: var(--card);
    border-radius: var(--radius-full);
    box-shadow: 0 1px 2px color-mix(in srgb, black 10%, transparent);
    transition: transform var(--animation-duration-normal)
      cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateX(2px);
    will-change: transform;
  }

  .switch-thumb.checked {
    transform: translateX(20px);
  }
</style>