<script context="module" lang="ts">
  export type DialogProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    className?: string;
  };
</script>

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { X } from "lucide-svelte";

  export let open: boolean = false;
  export let closeOnEscape: boolean = true;
  export let closeOnOutsideClick: boolean = true;
  export let className: string = "";

  const dispatch = createEventDispatcher();

  let dialogElement: HTMLDivElement;
  let backdropElement: HTMLDivElement;

  function close() {
    open = false;
    dispatch("openChange", false);
    dispatch("close");
  }

  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (closeOnOutsideClick && event.target === backdropElement) {
      close();
    }
  }

  function handleCloseClick() {
    close();
  }

  // Focus trap functionality
  function trapFocus(node: HTMLElement) {
    const focusableElements = node.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    }

    node.addEventListener("keydown", handleTabKey);
    firstFocusable?.focus();

    return {
      destroy() {
        node.removeEventListener("keydown", handleTabKey);
      },
    };
  }

  // Body scroll lock
  $: if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  onDestroy(() => {
    document.body.style.overflow = "";
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Portal-like behavior using global styles -->
  <div
    class="backdrop"
    bind:this={backdropElement}
    on:click={handleBackdropClick}
    role="presentation"
  >
    <div
      class="modal {className}"
      bind:this={dialogElement}
      use:trapFocus
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      on:click|stopPropagation
      on:keydown={(e) => e.stopPropagation()}
    >
      <slot />

      <button
        class="dismiss-button"
        on:click={handleCloseClick}
        aria-label="Close dialog"
        type="button"
      >
        <X class="dismiss-icon" size={16} />
        <span class="visually-hidden">Close</span>
      </button>
    </div>
  </div>
{/if}

<style>
  @layer base {
    :global(.backdrop) {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: var(--z-overlay, 1000);
      background-color: color-mix(in srgb, transparent 50%, black);
      animation: backdropFadeIn var(--animation-duration-normal, 200ms)
        cubic-bezier(0.16, 1, 0.3, 1);
    }

    :global(.modal) {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      width: 32rem;
      max-width: 90vw;
      max-height: 85vh;
      z-index: var(--z-overlay, 1000);
      border-radius: var(--radius-md, 0.5rem);
      background-color: var(--popup, white);
      color: var(--popup-foreground, #000);
      box-shadow: var(--shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
      overflow: auto;
      padding-block: var(--spacing-6, 1.5rem);
      padding-inline: var(--spacing-6, 1.5rem);
      animation: modalSlideIn var(--animation-duration-normal, 200ms)
        cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dismiss-button {
      position: absolute;
      right: var(--spacing-4, 1rem);
      top: var(--spacing-4, 1rem);
      width: 2rem;
      min-height: 2rem;
      border-radius: var(--radius-full, 9999px);
      background-color: var(--muted, #f5f5f5);
      color: var(--muted-foreground, #6c757d);
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition-property: background-color, color, transform;
      transition-duration: var(--animation-duration-fast, 150ms);
      transition-timing-function: ease;
    }

    .dismiss-button:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus, 0 0 0 2px currentColor);
    }

    .dismiss-button:hover {
      background-color: var(--muted-foreground, #6c757d);
      color: var(--muted, #f5f5f5);
      transform: scale(1.05);
    }

    .dismiss-icon {
      width: 1rem;
      min-height: 1rem;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      min-height: 1px;
      padding-block: 0;
      padding-inline: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    @keyframes backdropFadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes modalSlideIn {
      0% {
        opacity: 0;
        scale: 0.95;
      }
      100% {
        opacity: 1;
        scale: 1;
      }
    }
  }
</style>
