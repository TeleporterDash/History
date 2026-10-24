<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  
  export let open = false;
  export let delayDuration = 700;
  export const _skipDelayDuration = 300;
  export const _disableHoverableContent = false;
  export let sideOffset = 4;
  export let side = 'top';
  export const _align = 'center';
  export let className = '';

  const dispatch = createEventDispatcher();
  
  /**
   * @type {HTMLSpanElement}
   */
  let triggerElement;
  /**
   * @type {HTMLDivElement}
   */
  let contentElement;
  let mounted = false;
  /**
   * @type {string | number | NodeJS.Timeout | null | undefined}
   */
  let showTimeout;
  /**
   * @type {string | number | NodeJS.Timeout | null | undefined}
   */
  let hideTimeout;
  let isDelayedOpen = false;

  onMount(() => {
    mounted = true;
  });

  onDestroy(() => {
    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  function handleMouseEnter() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    
    showTimeout = setTimeout(() => {
      open = true;
      isDelayedOpen = true;
      dispatch('openChange', { open: true });
    }, delayDuration);
  }

  function handleMouseLeave() {
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
    
    hideTimeout = setTimeout(() => {
      open = false;
      isDelayedOpen = false;
      dispatch('openChange', { open: false });
    }, 100);
  }

  function handleFocus() {
    open = true;
    dispatch('openChange', { open: true });
  }

  function handleBlur() {
    open = false;
    dispatch('openChange', { open: false });
  }

  /**
   * @param {HTMLSpanElement} triggerEl
   * @param {HTMLDivElement} contentEl
   */
  function getPositionStyles(triggerEl, contentEl) {
    if (!triggerEl || !contentEl) return {};
    
    const triggerRect = triggerEl.getBoundingClientRect();
    const contentRect = contentEl.getBoundingClientRect();
    
    let top, left;
    
    switch (side) {
      case 'top':
        top = triggerRect.top - contentRect.height - sideOffset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left - contentRect.width - sideOffset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + sideOffset;
        break;
      default:
        top = triggerRect.top - contentRect.height - sideOffset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
    }
    
    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 'var(--z-overlay)'
    };
  }

  $: positionStyles = mounted && open && triggerElement && contentElement 
    ? getPositionStyles(triggerElement, contentElement) 
    : {};
</script>

<!-- Trigger slot -->
<span 
  bind:this={triggerElement}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:focus={handleFocus}
  on:blur={handleBlur}
  role="button"
  tabindex="0"
>
  <slot name="trigger" />
</span>

<!-- Content portal -->
{#if open && mounted}
  <div 
    bind:this={contentElement}
    class="tooltip-content {className}"
    class:delayed-open={isDelayedOpen}
    data-state={isDelayedOpen ? 'delayed-open' : 'open'}
    data-side={side}
    style={Object.entries(positionStyles).map(([key, value]) => `${key}: ${value}`).join('; ')}
    role="tooltip"
  >
    <slot name="content" />
  </div>
{/if}

<style>
  .tooltip-content {
    max-width: 20rem;
    padding: var(--spacing-2) var(--spacing-3);
    background-color: var(--popup);
    color: var(--popup-foreground);
    border-radius: var(--radius);
    font-size: 0.875rem;
    line-height: 1.4;
    box-shadow: var(--shadow-md);
    font-family: var(--font-family-base);
    border: 1px solid var(--border);
    z-index: var(--z-overlay);
    overflow-wrap: break-word;
    word-break: keep-all;
    pointer-events: none;

    /* Animation */
    animation-duration: var(--animation-duration-normal);
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  .tooltip-content.delayed-open[data-side="top"] {
    animation-name: slideDownAndFade;
  }

  .tooltip-content.delayed-open[data-side="bottom"] {
    animation-name: slideUpAndFade;
  }

  .tooltip-content.delayed-open[data-side="left"] {
    animation-name: slideRightAndFade;
  }

  .tooltip-content.delayed-open[data-side="right"] {
    animation-name: slideLeftAndFade;
  }

  @keyframes slideUpAndFade {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDownAndFade {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideLeftAndFade {
    from {
      opacity: 0;
      transform: translateX(4px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideRightAndFade {
    from {
      opacity: 0;
      transform: translateX(-4px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>