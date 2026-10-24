<script context="module" lang="ts">
  export type ButtonVariant =
    | "primary"
    | "outline"
    | "ghost"
    | "link"
    | "secondary"
    | "destructive";

  export type ButtonSize =
    | "sm"
    | "md"
    | "lg"
    | "icon"
    | "icon-sm"
    | "icon-md"
    | "icon-lg";
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let variant: ButtonVariant = "primary";
  export let size: ButtonSize = "md";
  export let asChild: boolean = false;
  export let disabled: boolean = false;
  export let type: "button" | "submit" | "reset" = "button";
  export let className: string = "";

  const dispatch = createEventDispatcher();

  $: classes = ["button", variant, size, disabled ? "disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  function handleClick(e: MouseEvent) {
    if (!disabled) {
      dispatch("click", e);
    }
  }
</script>

{#if asChild && $$restProps.as}
  <svelte:component
    this={$$restProps.as}
    class={classes}
    {disabled}
    on:click={handleClick}
    {...$$restProps}
  >
    <slot />
  </svelte:component>
{:else}
  <button
    class={classes}
    {disabled}
    {type}
    on:click={handleClick}
    {...$$restProps}
  >
    <slot />
  </button>
{/if}

<style>
  @layer base {
    /* Core button foundation */
    .button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2, 0.5rem);
      font-family: var(--font-family-base, inherit);
      font-weight: 500;
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      outline: none;
      border: 1px solid transparent;
      border-radius: var(--radius, 0.375rem);
      transition: all var(--animation-duration-fast, 150ms) ease;
    }

    /* Interactive states */
    .button:focus-visible {
      box-shadow: var(--shadow-focus, 0 0 0 2px currentColor);
    }

    .button:disabled,
    .disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Dimension configurations */
    .sm {
      min-height: 1.5rem;
      padding-inline: var(--spacing-2, 0.5rem);
      font-size: 0.875rem;
    }

    .md {
      min-height: 2.5rem;
      padding-inline: var(--spacing-3, 0.75rem);
      font-size: 0.9375rem;
    }

    .lg {
      min-height: 3rem;
      padding-inline: var(--spacing-4, 1rem);
      font-size: 1rem;
      border-radius: var(--radius-md, 0.5rem);
    }

    /* Square icon variants */
    .icon,
    .icon-md {
      aspect-ratio: 1;
      width: 2rem;
      padding: 0;
    }

    .icon-sm {
      aspect-ratio: 1;
      width: 1.5rem;
      padding: 0;
    }

    .icon-lg {
      aspect-ratio: 1;
      width: 2.5rem;
      padding: 0;
      border-radius: var(--radius-md, 0.5rem);
    }

    /* SVG icon dimensions */
    .button :global(svg) {
      flex-shrink: 0;
    }

    .sm :global(svg),
    .icon-sm :global(svg) {
      width: 1rem;
      height: 1rem;
    }

    .md :global(svg),
    .icon :global(svg),
    .icon-md :global(svg) {
      width: 1.25rem;
      height: 1.25rem;
    }

    .lg :global(svg),
    .icon-lg :global(svg) {
      width: 1.5rem;
      height: 1.5rem;
    }

    /* Theme variants */
    .primary {
      background: var(--primary, #007bff);
      color: var(--primary-foreground, white);
      --spinner-color: var(--primary-foreground, white);
    }

    .primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary, #007bff) 90%, black);
    }

    .primary:active:not(:disabled) {
      background: color-mix(in srgb, var(--primary, #007bff) 80%, black);
    }

    .secondary {
      background: var(--secondary, #6c757d);
      color: var(--secondary-foreground, white);
      --spinner-color: var(--secondary-foreground, white);
    }

    .secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--secondary, #6c757d) 90%, black);
    }

    .secondary:active:not(:disabled) {
      background: color-mix(in srgb, var(--secondary, #6c757d) 80%, black);
    }

    .destructive {
      background: var(--error, #dc3545);
      color: var(--error-foreground, white);
      --spinner-color: var(--error-foreground, white);
    }

    .destructive:hover:not(:disabled) {
      background: color-mix(in srgb, var(--error, #dc3545) 90%, black);
    }

    .destructive:active:not(:disabled) {
      background: color-mix(in srgb, var(--error, #dc3545) 80%, black);
    }

    .outline {
      background: transparent;
      border-color: var(--border, #dee2e6);
      color: var(--foreground, #212529);
      --spinner-color: var(--primary, #007bff);
    }

    .outline:hover:not(:disabled) {
      background: var(--muted, #f8f9fa);
    }

    .outline:active:not(:disabled) {
      background: color-mix(in srgb, var(--muted, #f8f9fa) 90%, black);
    }

    .ghost {
      background: transparent;
      color: var(--foreground, #212529);
      --spinner-color: var(--primary, #007bff);
    }

    .ghost:hover:not(:disabled) {
      background: var(--muted, #f8f9fa);
    }

    .ghost:active:not(:disabled) {
      background: color-mix(in srgb, var(--muted, #f8f9fa) 90%, black);
    }

    .link {
      background: transparent;
      color: var(--primary, #007bff);
      height: auto;
      padding: 0;
      text-decoration: none;
      --spinner-color: var(--primary, #007bff);
    }

    .link:hover:not(:disabled) {
      text-decoration: underline;
      color: color-mix(in srgb, var(--primary, #007bff) 90%, black);
    }

    .link:active:not(:disabled) {
      color: color-mix(in srgb, var(--primary, #007bff) 80%, black);
    }

    /* Dark theme adaptations */
    @media (prefers-color-scheme: dark) {
      :global(.dark) .outline:hover:not(:disabled) {
        background: var(--muted, #343a40);
      }

      :global(.dark) .outline:active:not(:disabled) {
        background: color-mix(in srgb, var(--muted, #343a40) 80%, black);
      }

      :global(.dark) .ghost:hover:not(:disabled) {
        background: var(--muted, #343a40);
      }

      :global(.dark) .ghost:active:not(:disabled) {
        background: color-mix(in srgb, var(--muted, #343a40) 80%, black);
      }
    }
  }
</style>