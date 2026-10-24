<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let open = false;
  /** @type {'top' | 'bottom' | 'left' | 'right'} */
  export let side = 'right'; // 'top' | 'bottom' | 'left' | 'right'
  export const _className = '';
  export let closeOnOverlayClick = true;
  export let closeOnEscape = true;

  const dispatch = createEventDispatcher();
  
  /**
   * @type {HTMLElement | null}
   */
  let previousActiveElement;
  /**
   * @type {HTMLDivElement}
   */
  let sheetElement;
  let mounted = false;

  onMount(() => {
    mounted = true;
    if (open) {
      handleOpen();
    }
  });

  onDestroy(() => {
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  });

  $: if (mounted) {
    if (open) {
      handleOpen();
    } else {
      handleClose();
    }
  }

  function handleOpen() {
    previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    
    // Focus the sheet after a brief delay to allow transition
    setTimeout(() => {
      if (sheetElement) {
        sheetElement.focus();
      }
    }, 100);
  }

  function handleClose() {
    document.body.style.overflow = '';
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  function closeSheet() {
    open = false;
    dispatch('openChange', { open: false });
  }

  /**
   * @param {{ target: any; currentTarget: any; }} event
   */
  function handleOverlayClick(event) {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      closeSheet();
    }
  }

  /**
   * @param {{ key: string; preventDefault: () => void; }} event
   */
  function handleKeydown(event) {
    if (!open) return;
    
    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      closeSheet();
    }

    // Trap focus within sheet
    if (event.key === 'Tab') {
      trapFocus(event);
    }
  }

  /**
   * @param {{ key?: string; preventDefault: any; shiftKey?: any; }} event
   */
  function trapFocus(event) {
    if (!sheetElement) return;
    
    const focusableElements = sheetElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        /** @type {HTMLElement} */ (lastElement).focus();
      }
    } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      /** @type {HTMLElement} */ (firstElement).focus();
    }
    }
  }

  // Animation functions for different sides
  /**
   * @param {HTMLDivElement} node
   * @param {{ side: 'top' | 'bottom' | 'left' | 'right'; }} options
   */
  function slideIn(node, { side }) {
    const transforms = {
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
      left: 'translateX(-100%)',
      right: 'translateX(100%)'
    };
    
    return {
      duration: 300,
      css: (/** @type {number} */ t) => {
        const eased = 1 - Math.pow(1 - t, 3); // cubic-bezier approximation
        return `transform: ${transforms[side]} scale(${0.95 + (eased * 0.05)})`;
      }
    };
  }

  /**
   * @param {HTMLDivElement} node
   * @param {{ side: 'top' | 'bottom' | 'left' | 'right'; }} options
   */
  function slideOut(node, { side }) {
    const transforms = {
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)',
      left: 'translateX(-100%)',
      right: 'translateX(100%)'
    };
    
    return {
      duration: 200,
      css: (/** @type {number} */ t) => {
        return `transform: ${transforms[side]} scale(${0.95 + (t * 0.05)})`;
      }
    };
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Portal-like behavior using a separate div -->
  <div class="sheet-portal">
    <!-- Overlay -->
    <div 
      class="sheet-overlay"
      transition:fade={{ duration: 300 }}
      on:click={handleOverlayClick}
      on:keydown={handleOverlayClick}
      role="presentation"
    ></div>
    
    <!-- Content -->
    <div
      bind:this={sheetElement}
      in:slideIn={{ side: /** @type {'top' | 'bottom' | 'left' | 'right'} */ (side) }}
      out:slideOut={{ side: /** @type {'top' | 'bottom' | 'left' | 'right'} */ (side) }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      aria-describedby="sheet-description"
      tabindex="-1"
    >
      <slot />
      
      <!-- Close button -->
      <button 
        type="button"
        class="sheet-close"
        on:click={closeSheet}
        aria-label="Close"
      >
        <svg class="sheet-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m18 6-12 12M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .sheet-portal {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay);
    pointer-events: none;
  }

  .sheet-overlay {
    position: fixed;
    inset: 0;
    background-color: color-mix(in srgb, black 50%, transparent);
    backdrop-filter: blur(2px);
    pointer-events: auto;
  }

  .sheet-content {
    position: fixed;
    z-index: var(--z-overlay);
    display: flex;
    flex-direction: column;
    background-color: var(--popup);
    color: var(--popup-foreground);
    box-shadow: var(--shadow-lg);
    overflow-y: auto;
    pointer-events: auto;
  }

  .sheet-content:focus {
    outline: none;
  }

  .sheet-top {
    top: 0;
    left: 0;
    right: 0;
    height: 80vh;
    max-height: 500px;
    border-bottom-left-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
  }

  .sheet-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 80vh;
    max-height: 500px;
    border-top-left-radius: var(--radius-md);
    border-top-right-radius: var(--radius-md);
  }

  .sheet-left {
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    border-top-right-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
  }

  .sheet-right {
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    border-top-left-radius: var(--radius-md);
    border-bottom-left-radius: var(--radius-md);
  }

  .sheet-close {
    position: absolute;
    top: var(--spacing-4);
    right: var(--spacing-4);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-full);
    background-color: var(--muted);
    color: var(--muted-foreground);
    border: none;
    cursor: pointer;
    transition: background-color var(--animation-duration-fast) ease,
      transform var(--animation-duration-fast) ease;
  }

  .sheet-close:hover {
    background-color: var(--muted-foreground);
    color: var(--muted);
    transform: scale(1.05);
  }

  .sheet-close:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .sheet-close-icon {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 640px) {
    .sheet-left,
    .sheet-right {
      max-width: 100%;
    }
  }
</style>